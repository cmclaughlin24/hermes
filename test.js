// Note: File used for development and testing of utility functions in isolation.
const flatten = require('flat');
const _ = require('lodash');

const startTime = new Date();

function elapsedTime() {
  return new Date().getTime() - startTime.getTime();
}

function hasFilterMatch(joinOperator, filters, payload) {
  console.log(`${hasFilterMatch.name} ${elapsedTime()}ms`);

  if (_.isEmpty(filters)) {
    return true;
  }

  return _.chain(filters)
    .map((filter) => evaluateFilter(filter, payload))
    .reduce(
      (accumulator, result) => joinFilters(joinOperator, accumulator, result),
      null,
    )
    .value();
}

function evaluateFilter(filter, payload) {
  console.log(`${evaluateFilter.name} ${elapsedTime()}ms`);

  const flatPayload = flatten(payload);
  let isMatch = false;

  if (!hasArrayNotation(filter.field)) {
    isMatch = compare(
      filter.operator,
      filter.query.value,
      flatPayload[filter.field],
    );
  } else {
    const keyPattern = '^' + filter.field.replace('*', '[0-9]+') + '$';
    const keyRegex = new RegExp(keyPattern);

    for (const key of Object.keys(flatPayload)) {
      if (!keyRegex.test(key)) {
        continue;
      }

      isMatch = compare(filter.operator, filter.query.value, flatPayload[key]);

      if (isMatch) {
        break;
      }
    }
  }

  return isMatch;
}

function joinFilters(joinOperator, accumulator, result) {
  console.log(`${joinFilters.name} ${elapsedTime()}ms`);

  switch (joinOperator) {
    case 'AND':
      return accumulator !== null ? accumulator && result : result;
    case 'OR':
      // Note: Nullish value will be overwritten automatically by OR operator.
      return accumulator || result;
    case 'NOT':
      // Note: Accumulator will already be have been inverted.
      return accumulator !== null ? accumulator && !result : !result;
    default:
      throw new Error(
        `Invalid Argument: Filter join operation ${joinOperator} not defined`,
      );
  }
}

function hasArrayNotation(field) {
  console.log(`${hasArrayNotation.name} ${elapsedTime()}ms`);

  return /\.?\*\.?/g.test(field);
}

function compare(operator, query, value) {
  console.log(`${compare.name}  ${elapsedTime()}ms`);

  switch (operator) {
    case 'EQUALS':
      return equals(query, value);
    case 'NEQUALS':
      return nequals(query, value);
    case 'OR':
      return or(query, value);
    case 'MATCHES':
      return matches(query, value);
    default:
      throw new Error(
        `Invalid Argument: Comparison for operator=${operator} is not defined`,
      );
  }
}

function equals(query, value) {
  return query === value;
}

function nequals(query, value) {
  return query !== value;
}

function or(query, value) {
  if (!Array.isArray(query)) {
    throw new Error(
      `Invalid Argument: When using OR, query must be array; recieved ${typeof query} instead`,
    );
  }

  return query.includes(value);
}

function matches(query, value) {
  if (typeof query !== 'string') {
    throw new Error(
      `Invalid Argument: When using MATCHES, query must be string; recieved ${typeof query} instead`,
    );
  }

  if (typeof value !== 'string') {
    throw new Error(
      `Invalid Argument: When using MATCHES, value must be string; recieved ${typeof value} instead`,
    );
  }

  return new RegExp(query).test(value);
}

const filters = [
  {
    field: '*.name',
    query: {
      type: 'string',
      value: 'Charles$',
    },
    operator: 'MATCHES',
  },
  {
    field: '*.gender',
    query: {
      type: 'string',
      value: 'male',
    },
    operator: 'EQUALS',
  },

];

const data = [
  {
    _id: '644baa7a7b47d55229cbd443',
    index: 0,
    guid: 'b007d681-1730-4733-8938-763e532b48c7',
    isActive: true,
    balance: '$3,120.62',
    picture: 'http://placehold.it/32x32',
    age: 24,
    eyeColor: 'green',
    name: 'Morgan Charles',
    gender: 'female',
    company: 'PIGZART',
    email: 'morgancharles@pigzart.com',
    phone: '+1 (840) 588-2383',
    address: '861 Wakeman Place, Manila, Virginia, 7938',
    about:
      'Ex sit ea laboris commodo incididunt consequat est sint duis esse commodo Lorem ipsum. Laborum laboris in aute elit minim fugiat irure sit proident enim in labore amet. Et voluptate anim id ad. Sunt cupidatat et est aute mollit est amet magna incididunt dolor id.\r\n',
    registered: '2019-03-21T03:43:25 +05:00',
    latitude: 36.335269,
    longitude: -96.546521,
    tags: [
      'aute',
      'ad',
      'exercitation',
      'pariatur',
      'officia',
      'ullamco',
      'consectetur',
    ],
    friends: [
      {
        id: 0,
        name: 'Sharron Fox',
      },
      {
        id: 1,
        name: 'Adkins Crane',
      },
      {
        id: 2,
        name: 'Boyer Howe',
      },
    ],
    greeting: 'Hello, Morgan Charles! You have 5 unread messages.',
    favoriteFruit: 'strawberry',
  },
  {
    _id: '644baa7ac575755f68a3e60a',
    index: 1,
    guid: '66f0adb4-91a8-449a-9da0-0ba2bb67edd6',
    isActive: false,
    balance: '$3,145.65',
    picture: 'http://placehold.it/32x32',
    age: 34,
    eyeColor: 'brown',
    name: 'Harriett Phelps',
    gender: 'female',
    company: 'SIGNIDYNE',
    email: 'harriettphelps@signidyne.com',
    phone: '+1 (952) 549-2824',
    address: '809 Hart Street, Savage, Utah, 5024',
    about:
      'Mollit pariatur adipisicing qui voluptate elit enim adipisicing do minim labore et ea laboris culpa. Et deserunt veniam cupidatat ut velit voluptate cupidatat dolor officia cillum excepteur culpa. Laboris veniam aliquip esse nulla velit. Irure ex fugiat do occaecat mollit duis fugiat eiusmod proident dolor incididunt. Sit commodo amet est consectetur ut ut proident excepteur ut nisi. Consectetur esse commodo magna culpa nisi sunt.\r\n',
    registered: '2020-04-11T06:05:05 +05:00',
    latitude: -6.782594,
    longitude: 7.938196,
    tags: [
      'sint',
      'dolore',
      'reprehenderit',
      'anim',
      'pariatur',
      'commodo',
      'incididunt',
    ],
    friends: [
      {
        id: 0,
        name: 'Hurley Murray',
      },
      {
        id: 1,
        name: 'Lena Flowers',
      },
      {
        id: 2,
        name: 'Dora Kirk',
      },
    ],
    greeting: 'Hello, Harriett Phelps! You have 7 unread messages.',
    favoriteFruit: 'apple',
  },
  {
    _id: '644baa7aa29c140e2672c5b6',
    index: 2,
    guid: '7bc1a04e-9a36-47e0-a73f-7c52a2be18b1',
    isActive: false,
    balance: '$3,941.81',
    picture: 'http://placehold.it/32x32',
    age: 31,
    eyeColor: 'green',
    name: 'Patsy Middleton',
    gender: 'female',
    company: 'GEEKMOSIS',
    email: 'patsymiddleton@geekmosis.com',
    phone: '+1 (832) 557-3848',
    address: '864 Mill Street, Tuttle, Rhode Island, 6493',
    about:
      'Ullamco deserunt aute deserunt dolor elit officia aliqua voluptate. Nisi nulla irure officia laborum. Do in nostrud cillum proident ea ex quis reprehenderit velit non enim non. Magna est sit fugiat esse aliquip dolore consequat amet duis irure aliquip tempor. Consectetur fugiat sit sit incididunt sit do ad magna minim velit qui non.\r\n',
    registered: '2015-01-20T02:17:57 +06:00',
    latitude: -77.247992,
    longitude: 46.550389,
    tags: [
      'officia',
      'sint',
      'magna',
      'cillum',
      'incididunt',
      'excepteur',
      'sunt',
    ],
    friends: [
      {
        id: 0,
        name: 'Jerri Gill',
      },
      {
        id: 1,
        name: 'Chambers Drake',
      },
      {
        id: 2,
        name: 'Kristina Morgan',
      },
    ],
    greeting: 'Hello, Patsy Middleton! You have 10 unread messages.',
    favoriteFruit: 'apple',
  },
  {
    _id: '644baa7a8584d36739947c30',
    index: 3,
    guid: '998b4321-e64a-40b1-aac8-1c89b25423e8',
    isActive: false,
    balance: '$1,330.80',
    picture: 'http://placehold.it/32x32',
    age: 35,
    eyeColor: 'brown',
    name: 'Maynard Clark',
    gender: 'male',
    company: 'TOURMANIA',
    email: 'maynardclark@tourmania.com',
    phone: '+1 (813) 501-3739',
    address: '163 Drew Street, Crenshaw, Arkansas, 6290',
    about:
      'Ex nostrud dolore incididunt irure nisi consectetur consectetur non eiusmod. Occaecat consequat sit eiusmod incididunt enim velit qui tempor incididunt velit labore esse culpa. Tempor commodo aute eu duis fugiat Lorem ex adipisicing laborum consectetur qui sint officia eiusmod. Elit adipisicing qui cupidatat quis labore deserunt laborum labore pariatur. Aliqua dolor labore Lorem in deserunt mollit deserunt tempor deserunt ullamco veniam ea. Sint cupidatat elit aliqua consequat dolore anim ipsum. Aliquip ad duis nisi commodo cupidatat Lorem deserunt nostrud id deserunt.\r\n',
    registered: '2020-08-16T09:06:50 +05:00',
    latitude: 78.664285,
    longitude: -139.745182,
    tags: ['consequat', 'non', 'ut', 'amet', 'officia', 'minim', 'ipsum'],
    friends: [
      {
        id: 0,
        name: 'Bray Pratt',
      },
      {
        id: 1,
        name: 'Jayne Crawford',
      },
      {
        id: 2,
        name: 'Lessie Ford',
      },
    ],
    greeting: 'Hello, Maynard Clark! You have 2 unread messages.',
    favoriteFruit: 'banana',
  },
  {
    _id: '644baa7a9f867201a59f69ad',
    index: 4,
    guid: 'd90092d3-aa30-4d22-aada-37a7b7eac396',
    isActive: true,
    balance: '$1,900.90',
    picture: 'http://placehold.it/32x32',
    age: 30,
    eyeColor: 'blue',
    name: 'Stacie Grant',
    gender: 'female',
    company: 'QUARMONY',
    email: 'staciegrant@quarmony.com',
    phone: '+1 (968) 565-2403',
    address: '718 Lott Place, Buxton, Kansas, 4412',
    about:
      'Adipisicing reprehenderit aliquip ad labore esse aliquip sit enim cillum ullamco eu qui amet. Tempor et commodo et ea deserunt aliquip. Excepteur esse elit consectetur veniam magna officia. Officia tempor proident exercitation nisi laborum est pariatur sint incididunt.\r\n',
    registered: '2018-09-03T08:25:46 +05:00',
    latitude: 73.706952,
    longitude: 69.244331,
    tags: ['tempor', 'eu', 'id', 'quis', 'dolor', 'aliqua', 'proident'],
    friends: [
      {
        id: 0,
        name: 'Cohen Mccall',
      },
      {
        id: 1,
        name: 'Barron Gibson',
      },
      {
        id: 2,
        name: 'Weiss Newman',
      },
    ],
    greeting: 'Hello, Stacie Grant! You have 5 unread messages.',
    favoriteFruit: 'strawberry',
  },
  {
    _id: '644baa7acac0ec188c747f6b',
    index: 5,
    guid: '4caf9db5-dac3-4f51-97f9-ad0c714fc7ed',
    isActive: true,
    balance: '$2,070.23',
    picture: 'http://placehold.it/32x32',
    age: 33,
    eyeColor: 'green',
    name: 'Earline Knapp',
    gender: 'female',
    company: 'PERKLE',
    email: 'earlineknapp@perkle.com',
    phone: '+1 (931) 471-3657',
    address: '921 Seaview Court, Trona, Connecticut, 2832',
    about:
      'Reprehenderit exercitation culpa ut ad fugiat ex ipsum. Proident occaecat id adipisicing mollit. Sint velit incididunt ut cillum qui minim. Ea tempor enim sit laborum aliqua enim sint. Incididunt ut tempor elit ullamco quis reprehenderit.\r\n',
    registered: '2017-10-10T05:12:45 +05:00',
    latitude: -32.043431,
    longitude: 101.216052,
    tags: ['tempor', 'occaecat', 'tempor', 'eu', 'deserunt', 'elit', 'ad'],
    friends: [
      {
        id: 0,
        name: 'Glover Goodman',
      },
      {
        id: 1,
        name: 'Porter Hampton',
      },
      {
        id: 2,
        name: 'Saunders Lyons',
      },
    ],
    greeting: 'Hello, Earline Knapp! You have 4 unread messages.',
    favoriteFruit: 'apple',
  },
];

console.log(hasFilterMatch('AND', filters, data));
