/**
 * All Postgres messages are assigned a five-character [error code](https://www.postgresql.org/docs/10/errcodes-appendix.html).
 */
export enum PostgresError {
  UNIQUE_VIOLATION = '23505',
}
