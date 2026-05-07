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
  'ID': unknown;
  'Int': unknown;
  'Mutation': {
    kind: 'OBJECT';
    name: 'Mutation';
    fields: {
      'getHenMintSignature': { name: 'getHenMintSignature'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'HenMintSignature'; ofType: null; }; }; };
    };
  };
  'Query': {
    kind: 'OBJECT';
    name: 'Query';
    fields: {
      'getMyShutdownHens': { name: 'getMyShutdownHens'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'ShutdownHen'; ofType: null; }; }; }; }; };
    };
  };
  'ShutdownHen': {
    kind: 'OBJECT';
    name: 'ShutdownHen';
    fields: {
      'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; };
      'level': { name: 'level'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; }; };
      'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; }; };
      'onchainOwnerAddress': { name: 'onchainOwnerAddress'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; };
      'serialId': { name: 'serialId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; }; };
    };
  };
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
