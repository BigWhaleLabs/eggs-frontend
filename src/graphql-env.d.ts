/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
  'Float': unknown;
  'HenMintSignature': {
    kind: 'OBJECT';
    name: 'HenMintSignature';
    fields: {
      'message': { name: 'message'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; };
      'r': { name: 'r'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; };
      'signature': { name: 'signature'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; };
      'vs': { name: 'vs'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; };
    };
  };
  'Mutation': {
    kind: 'OBJECT';
    name: 'Mutation';
    fields: {
      'getHenMintSignature': { name: 'getHenMintSignature'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'HenMintSignature'; ofType: null; }; }; };
    };
  };
  'Query': { kind: 'OBJECT'; name: 'Query'; fields: {}; };
  'String': unknown;
};

export type introspection = {
  name: never
  query: 'Query'
  mutation: 'Mutation'
  subscription: never
  types: introspection_types
}

import * as gqlTada from 'gql.tada'

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}
