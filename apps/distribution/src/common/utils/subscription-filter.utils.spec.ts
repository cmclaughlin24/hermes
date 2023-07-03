import { SubscriptionQueryDto } from '../../resources/subscription/dto/subscription-query.dto';
import { SubscriptionFilter } from '../../resources/subscription/entities/subscription-filter.entity';
import { Subscription } from '../../resources/subscription/entities/subscription.entity';
import { FilterJoinOps, FilterOps } from '../types/filter.type';
import {
  compare,
  equals,
  evaluateFilter,
  filterSubscriptions,
  hasArrayNotation,
  joinFilters,
  matches,
  nequals,
  or,
  shouldNotify,
} from './subscription-filter.utils';

describe('subscription-filter.utils.ts', () => {
  describe('filterSubscriptions()', () => {
    const payload = {
      console: 'GameCube',
      games: [
        {
          name: 'Legend of Zelda: Wind Waker',
          releaseDate: {
            year: 2003,
          },
          developer: 'Nintendo',
        },
        {
          name: 'Super Smash Bros Melee',
          releaseDate: {
            year: 2001,
          },
          developer: 'HAL Laboratory',
        },
        {
          name: 'Scooby-Doo: Night of 100 Frights',
          releaseDate: {
            year: 2002,
          },
          developer: 'Heavy Iron Studios',
        },
      ],
    };

    it('should yield a list of subscriptions whose filters evaluate to true for a payload', () => {
      // Arrange.
      const subscriptions = [
        {
          filterJoin: FilterJoinOps.OR,
          filters: [
            {
              field: 'games.*.developer',
              operator: FilterOps.EQUALS,
              query: {
                dataType: 'string',
                value: 'Nintendo',
              },
            } as SubscriptionFilter,
            {
              field: 'console',
              operator: FilterOps.MATCHES,
              query: {
                dataType: 'string',
                value: 'Game',
              },
            } as SubscriptionFilter,
          ],
        } as Subscription,
        {
          filterJoin: FilterJoinOps.AND,
          filters: [
            {
              field: 'games.*.releaseDate.year',
              operator: FilterOps.EQUALS,
              query: {
                dataType: 'number',
                value: 1999,
              },
            } as SubscriptionFilter,
            {
              field: 'games.*.name',
              operator: FilterOps.OR,
              query: {
                dataType: 'array',
                value: ['Scooby-Doo: Night of 100 Frights', 'Sonic Riders'],
              },
            } as SubscriptionFilter,
          ],
        } as Subscription,
        {
          filterJoin: FilterJoinOps.AND,
          filters: [],
        } as Subscription,
      ];
      const expectedResult = [subscriptions[0], subscriptions[2]];

      // Act.
      const result = filterSubscriptions(subscriptions, payload);

      // Assert.
      expect(result).toEqual(expectedResult);
    });

    it('should yield an empty list if the subscriptions argument is empty', () => {
      // Act.
      const result = filterSubscriptions([], payload);

      // Assert.
      expect(result.length).toBe(0);
    });

    it('should yield the subscriptions argument if the payload argument is null/undefined', () => {
      // Arrange.
      const subscriptions = [
        {
          filterJoin: FilterJoinOps.OR,
          filters: [
            {
              field: 'games.*.developer',
              operator: FilterOps.EQUALS,
              query: {
                dataType: 'string',
                value: 'Nintendo',
              },
            } as SubscriptionFilter,
            {
              field: 'console',
              operator: FilterOps.MATCHES,
              query: {
                dataType: 'string',
                value: 'Game',
              },
            } as SubscriptionFilter,
          ],
        } as Subscription,
        {
          filterJoin: FilterJoinOps.AND,
          filters: [],
        } as Subscription,
      ];

      // Act.
      const result = filterSubscriptions(subscriptions, null);

      // Assert.
      expect(result).toEqual(subscriptions);
    });
  });

  describe('shouldNotify()', () => {
    const payload = {
      consoles: [
        {
          name: 'Nintendo Switch',
          manufacturer: 'Nintendo',
          games: ['Legend of Zelda: Breath of the Wild', 'Super Mario Odyssey'],
          price: 299.99,
        },
        {
          name: 'Xbox One',
          manufacturer: 'Microsoft',
          games: ['Titanfall', 'Ryse: Son of Rome'],
          price: 499.99,
        },
        {
          name: 'Playstation 4',
          manufacturer: 'Sony',
          games: ['Spiderman', 'Final Fantasy VII Remake'],
          price: 399.99,
        },
      ],
    };

    it('should yield true if a subscription should recieve a notification', () => {
      // Arrange.
      const subscription = {
        filterJoin: FilterJoinOps.AND,
        filters: [
          {
            field: 'consoles.*.name',
            operator: FilterOps.EQUALS,
            query: {
              dataType: 'string',
              value: 'Nintendo Switch',
            },
          } as SubscriptionFilter,
          {
            field: 'consoles.*.games.*',
            operator: FilterOps.OR,
            query: {
              dataType: 'array',
              value: ['Legend of Zelda: Breath of the Wild'],
            },
          } as SubscriptionFilter,
        ],
      } as Subscription;

      // Act.
      const result = shouldNotify(subscription, payload);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if a subscription does not have any filters', () => {
      // Act.
      const result = shouldNotify({} as Subscription, payload);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false if a subscription should not recieve a notification', () => {
      // Arrange.
      const subscription = {
        filterJoin: FilterJoinOps.NOT,
        filters: [
          {
            field: 'consoles.*.name',
            operator: FilterOps.MATCHES,
            query: {
              dataType: 'string',
              value: 'Xbox',
            },
          } as SubscriptionFilter,
          {
            field: 'consoles.*.games.*',
            operator: FilterOps.EQUALS,
            query: {
              dataType: 'string',
              value: 'Titanfall',
            },
          } as SubscriptionFilter,
        ],
      } as Subscription;

      // Act.
      const result = shouldNotify(subscription, payload);

      // Assert.
      expect(result).toBeFalsy();
    });
  });

  describe('evaluateFilter()', () => {
    const payload = {
      console: 'Xbox Series X',
      games: ['Halo Infinite', 'Hi-Fi Rush', 'Tales of Arise'],
      releaseDate: {
        year: 2020,
      },
    };

    it('should yield the result of the filter criteria applied to the payload (w/o array notation, true)', () => {
      // Arrange.
      const filter = {
        operator: FilterOps.EQUALS,
        query: {
          dataType: 'string',
          value: 'Xbox Series X',
        },
        field: 'console',
      } as SubscriptionFilter;

      // Act.
      const result = evaluateFilter(filter, payload);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield the result of the filter criteria applied to the payload (w/array notation, true)', () => {
      // Arrange.
      const filter = {
        operator: FilterOps.OR,
        query: {
          dataType: 'string',
          value: ['Tales of Arise'],
        },
        field: 'games.*',
      } as SubscriptionFilter;

      // Act.
      const result = evaluateFilter(filter, payload);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield the result of the filter criteria applied to the payload (w/o array notation, false)', () => {
      // Arrange.
      const filter = {
        operator: FilterOps.NEQUALS,
        query: {
          dataType: 'number',
          value: 2020,
        },
        field: 'releaseDate.year',
      } as SubscriptionFilter;

      // Act.
      const result = evaluateFilter(filter, payload);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield the result of the filter criteria applied to the payload (w/array notation, false)', () => {
      // Arrange.
      const filter = {
        operator: FilterOps.MATCHES,
        query: {
          dataType: 'string',
          value: 'Gears of War',
        },
        field: 'games.*',
      } as SubscriptionFilter;

      // Act.
      const result = evaluateFilter(filter, payload);

      // Assert.
      expect(result).toBeFalsy();
    });
  });

  describe('joinFilters()', () => {
    it('should yield the result of the join operation (and)', () => {
      // Arrange.
      const accumulator = true;
      const next = false;

      // Act.
      const result = joinFilters(FilterJoinOps.AND, accumulator, next);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield the result of the join operation (or)', () => {
      // Arrange.
      const accumulator = true;
      const next = false;

      // Act.
      const result = joinFilters(FilterJoinOps.OR, accumulator, next);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield the result of the join operation (not)', () => {
      // Arrange.
      const accumulator = true;
      const next = false;

      // Act.
      const result = joinFilters(FilterJoinOps.NOT, accumulator, next);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should throw an error if the join operator cannot be identified', () => {
      // Arrange.
      const join = 'testing';
      const expectedResult = new Error(
        `Invalid Argument: Filter join operation ${join} not defined`,
      );

      // Act.
      const fn = joinFilters.bind(null, join, null, null);

      // Assert.
      expect(fn).toThrow(expectedResult);
    });
  });

  describe('hasArrayNotation()', () => {
    it('should yield true if the field contains array notation (beginning)', () => {
      // Arrange.
      const field = '*.console';

      // Act.
      const result = hasArrayNotation(field);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the field contains array notation (middle)', () => {
      // Arrange.
      const field = 'console.games.*.name';

      // Act.
      const result = hasArrayNotation(field);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the field contains array notation (end)', () => {
      // Arrange.
      const field = 'games.tags.*';

      // Act.
      const result = hasArrayNotation(field);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false if the field does not contain array notation', () => {
      // Arrange.
      const field = 'console.name';

      // Act.
      const result = hasArrayNotation(field);

      // Assert.
      expect(result).toBeFalsy();
    });
  });

  describe('compare()', () => {
    it('should yield the result of the comparison function (equals)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: 'Star Wars: Battlefront II',
      };
      const value = 'Star Wars: Battlefront';

      // Act.
      const result = compare(FilterOps.EQUALS, query, value);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield the result of the comparison function (nequals)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'boolean',
        value: true,
      };
      const value = false;

      // Act.
      const result = compare(FilterOps.NEQUALS, query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield the result of the comparison function (or)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'array',
        value: [1, 2, 3, 4, 5],
      };
      const value = 4;

      // Act.
      const result = compare(FilterOps.OR, query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield the result of the comparison function (matches)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: '^Halo: The Master Chief Collection$',
      };
      const value = 'Halo: Combat Evolved';

      // Act.
      const result = compare(FilterOps.MATCHES, query, value);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should throw an error if filter operator cannot be identified', () => {
      // Arrange.
      const operator = 'testing';
      const expectedResult = new Error(
        `Invalid Argument: Comparison for operator=${operator} is not defined`,
      );

      // Act.
      const fn = compare.bind(null, operator, {} as SubscriptionQueryDto, null);

      // Assert.
      expect(fn).toThrow(expectedResult);
    });
  });

  describe('equals()', () => {
    it('should yield true if the value argument is equal to the SubscriptionQueryDto (string)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: 'Super Smash Bros: Melee',
      };
      const value = 'Super Smash Bros: Melee';

      // Act.
      const result = equals(query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the value argument is equal to the SubscriptionQueryDto (number)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'number',
        value: 18,
      };
      const value = 18;

      // Act.
      const result = equals(query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the value argument is equal to the SubscriptionQueryDto (boolean)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'boolean',
        value: true,
      };
      const value = true;

      // Act.
      const result = equals(query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false if the value argument is not equal to the SubscriptionQueryDto (string)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: 'Super Smash Bros: Melee',
      };
      const value = 'Super Smash Bros: Ultimate';

      // Act.
      const result = equals(query, value);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield false if the value argument is not equal to the SubscriptionQueryDto (number)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'number',
        value: 18,
      };
      const value = 11;

      // Act.
      const result = equals(query, value);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield false if the value argument is not equal to the SubscriptionQueryDto (boolean)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'boolean',
        value: true,
      };
      const value = false;

      // Act.
      const result = equals(query, value);

      // Assert.
      expect(result).toBeFalsy();
    });
  });

  describe('nequals()', () => {
    it('should yield true if the value argument is not equal to the SubscriptionQueryDto (string)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: 'Legend of Zelda: Tears of the Kingdom',
      };
      const value = 'Legend of Zelda: Breath of the Wild';

      // Act.
      const result = nequals(query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the value argument is not equal to the SubscriptionQueryDto (number)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'number',
        value: 69,
      };
      const value = 24;

      // Act.
      const result = nequals(query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield true if the value argument is not equal to the SubscriptionQueryDto (boolean)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'boolean',
        value: true,
      };
      const value = false;

      // Act.
      const result = nequals(query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false if the value arugment is equal to the SubscriptionQueryDto (string)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: 'Super Mario Sunshine',
      };
      const value = 'Super Mario Sunshine';

      // Act.
      const result = nequals(query, value);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield false if the value arugment is equal to the SubscriptionQueryDto (number)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'number',
        value: 69,
      };
      const value = 69;

      // Act.
      const result = nequals(query, value);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should yield false if the value arugment is equal to the SubscriptionQueryDto (boolean)', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'boolean',
        value: true,
      };
      const value = true;

      // Act.
      const result = nequals(query, value);

      // Assert.
      expect(result).toBeFalsy();
    });
  });

  describe('or()', () => {
    it('should yield true if is included in the SubscriptionQueryDto', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'array',
        value: ['apple', 'watermelon', 'peach', 'banana'],
      };
      const value = 'peach';

      // Act.
      const result = or(query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false if the value argument is not included in the SubscriptionQueryDto', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'array',
        value: [1, 3, 5, 7, 9],
      };
      const value = 2;

      // Act.
      const result = or(query, value);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should throw an error if the value property of the query argument is not an array', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: 'unit-test',
      };
      const expectedResult = new Error(
        `Invalid Argument: When using OR, query must be array; recieved ${typeof query.value} instead`,
      );

      // Act.
      const fn = or.bind(null, query, '');

      // Assert.
      expect(fn).toThrow(expectedResult);
    });
  });

  describe('matches()', () => {
    it('should yield true if the regex pattern defined in the SubscriptionQueryDto exists in the value argument', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: 'unit-test',
      };
      const value = '^unit-test$';

      // Act.
      const result = matches(query, value);

      // Assert.
      expect(result).toBeTruthy();
    });

    it('should yield false if the regex pattern defined in the SubscriptionQueryDto does not exist in the value argument', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: 'unit-test',
      };
      const value = '^unit$';

      // Act.
      const result = matches(query, value);

      // Assert.
      expect(result).toBeFalsy();
    });

    it('should throw an error if the value property of the query argument is not a string', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'number',
        value: 1,
      };
      const expectedResult = new Error(
        `Invalid Argument: When using MATCHES, query must be string; recieved ${typeof query.value} instead`,
      );

      // Act.
      const fn = matches.bind(null, query, '');

      // Assert.
      expect(fn).toThrow(expectedResult);
    });

    it('should throw an error if the value argument is not a string', () => {
      // Arrange.
      const query: SubscriptionQueryDto = {
        dataType: 'string',
        value: 'unit-test',
      };
      const value = true;
      const expectedResult = new Error(
        `Invalid Argument: When using MATCHES, value must be string; recieved ${typeof value} instead`,
      );

      // Act.
      const fn = matches.bind(null, query, value);

      // Assert.
      expect(fn).toThrow(expectedResult);
    });
  });
});
