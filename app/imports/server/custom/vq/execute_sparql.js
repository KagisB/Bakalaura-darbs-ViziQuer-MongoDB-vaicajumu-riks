import { Meteor } from 'meteor/meteor';

// import { Diagrams } from '/imports/db/platform/collections';
import { is_project_member } from '/imports/libs/platform/user_rights';
import { is_public_diagram } from '/imports/server/platform/_helpers'

import { VQ_sparql_logs } from '/imports/db/custom/vq/collections';

// import fetch from 'node-fetch';

function removeMultilines(q) {
  return q
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .replace(/ {2}/g, ' ')
    .trim();
}

function encodeQueryForUrl(q) {
  const query = removeMultilines(q);
  return encodeURIComponent(query);
}

// function encodeQueryForBody(q) {
//   const query = removeMultilines(q)
//     .replace(/ /g, '+');
//   return encodeURIComponent(query);
// }

// function encodeQuery(q) {
//     let query = q.replace(/(\r\n|\n|\r)/gm," ");
//     query = encodeURIComponent(query);
//     query = query.replace(/\*/g, '%2A');
//     query = query.replace(/\(/g, '%28');
//     query = query.replace(/\)/g, '%29');
//     return query;
// }

function encodeQuery2(q) {
  const query = q.replace(/(\r\n|\n|\r)/gm, ' ')
    .replace(/\s/g, '+')
    .replace(/\?/g, '%3F')
    .replace(/\{/g, '%7B')
    .replace(/\}/g, '%7D');

  // query = query.replace(/\*/g, '%2A');
  // query = query.replace(/\(/g, '%28');
  // query = query.replace(/\)/g, '%29');

  return query;
}

// function encodeQuery3(q) {
//     let query = q.replace(/(\r\n|\n|\r)/gm," ");

//     // query = query.replace(/\s/g, '+');
//     query = query.replace(/\s/g, '%20');
//     query = query.replace(/\!/g, '%21');
//     query = query.replace(/\#/g, '%23');
//     query = query.replace(/\$/g, '%24');
//     query = query.replace(/\%/g, '%25');
//     query = query.replace(/\&/g, '%26');
//     query = query.replace(/\'/g, '%27');
//     query = query.replace(/\(/g, '%28');
//     query = query.replace(/\)/g, '%29');
//     query = query.replace(/\*/g, '%2A');
//     query = query.replace(/\+/g, '%2B');
//     query = query.replace(/\,/g, '%2C');
//     query = query.replace(/\//g, '%2F');
//     query = query.replace(/\:/g, '%3A');
//     query = query.replace(/\;/g, '%3B');
//     query = query.replace(/\=/g, '%3D');
//     query = query.replace(/\?/g, '%3F');
//     query = query.replace(/\@/g, '%40');
//     query = query.replace(/\[/g, '%5B');
//     query = query.replace(/\]/g, '%5D');

//     return query;
// }

// function isURL(s) {
//   const regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
//   return regexp.test(s);
// }

function buildEnhancedQuery(originalQuery, fragmentToFind, fragmentToInsert, fragmentToAdd) {
  const index_of_first_occurence = originalQuery.search(new RegExp(fragmentToFind, 'i'));
  if (index_of_first_occurence !== -1) {
    return originalQuery.substr(0, index_of_first_occurence) + fragmentToInsert + originalQuery.substr(index_of_first_occurence) + fragmentToAdd;
  }
  // console.error('No SELECT in the query');
  throw new Error('No SELECT in the query');
}

function add_sparql_log(log) {
  VQ_sparql_logs.insert(log);
}

function hasAuthInfo(params) {
  return params.endpointUsername && params.endpointPassword;
}

function makeAuthString(params) {
  return `${params.endpointUsername}:${params.endpointPassword}`;
}

function detectContentType(content) {
  if (!content) {
    return 'empty';
  }
  if (typeof content !== 'string') {
    return 'not a string';
  }

  const text = content.toLowerCase().trim();
  let ct = 'text';
  if (text.startsWith('<?xml')) ct = 'xml';
  if (text.startsWith('<sparql')) ct = 'xml';
  if (text.startsWith('{')) ct = 'json'; // REFINE ME
  if (text.startsWith('<!doctype')) ct = 'html';
  if (text.startsWith('<html')) ct = 'html';
  if (text.startsWith('<!--')) ct = 'html';
  return `${ct} (${text.length} chars, "${text.length < 32 ? text : `${text.slice(0, 32)}...`}")`;
}

const TIMEOUT = 0;

const XML_FORMAT = 'application/sparql-results+xml';
const JSON_FORMAT = 'application/sparql-results+json';
const XML_FORMAT_SHORT = 'xml';
const JSON_FORMAT_SHORT = 'json';

const USER_AGENT = 'ViziQuer 0.x';

// const ENDPOINT_TEST_QUERY = 'SELECT ?a ?b ?c where{?a ?b ?c} LIMIT 10';
const ENDPOINT_TEST_QUERY = 'SELECT (COUNT(*) AS ?number_of_rows_in_query_xyz) WHERE { SELECT ?a ?b ?c where{?a ?b ?c} LIMIT 10 }';

const COMMON_HEADERS = {
  'User-Agent': USER_AGENT,
  'Cache-Control': 'no-cache',
};

const DO_CALL_DEBUG = (method, url, options, cb) => {
  console.log('☕', method, decodeURI(url), options);
  if (cb) {
    try {
      HTTP.call(method, url, options, (err, resp) => {
        if (resp.statusCode >= 300) {
          console.log('🥤🥤', err, resp);
        }
        console.log('🦊🦊', resp.statusCode, resp.headers['content-type'], detectContentType(resp.content));
        cb(err, resp);
      });
    } catch (err) {
      cb(err);
    }
  } else {
    try {
      const resp = HTTP.call(method, url, options);
      if (resp.statusCode >= 300) {
        console.log('🥤', resp.statusCode, resp);
      }
      console.log('🦊', resp.statusCode, resp.headers['content-type'], detectContentType(resp.content));
      return resp;
    } catch (err) {
      console.error('Error in HTTP call', err);
      return err;
    }
  }
};

const DO_CALL_PROD = (method, url, options, cb) => {
  if (cb) {
    try {
      HTTP.call(method, url, options, cb);
    } catch (err) {
      cb(err);
    }
  } else {
    try {
      return HTTP.call(method, url, options);
    } catch (err) {
      return err;
    }
  }
};

const DO_CALL = DO_CALL_DEBUG;
// const DO_CALL = DO_CALL_PROD;

// NOTE: Blazegraph does not like an empty value for the parameter 'default-graph-uri'.
// NOTE: Blazegraph seems to like User-Agent.

/**
 * HTTP request profiles for calling SPARQL endpoints:
 *
 * P1* - GET with encoded params in URL,
 * P2* - POST with encoded params in body,
 * P3* - POST with raw query in body and remaining params encoded in URL, and
 * P4* - POST with encoded params in URL (non-standard).
 */

function doHttpRequestP1(url, httpOptions, query, namedGraph, preferJSON, callback) {
  // console.log("profile P1", url, query, namedGraph, httpOptions, preferJSON);
  // let fullUrl = `${url}?query=${encodeQuery2(query)}`;
  let fullUrl = `${url}?query=${encodeQueryForUrl(query)}`;
  if (namedGraph) {
    fullUrl += `&default-graph-uri=${encodeURIComponent(namedGraph)}`;
  }
  const fullOptions = { ...httpOptions, timeout: TIMEOUT };
  fullOptions.headers = { ...COMMON_HEADERS };
  if (preferJSON) {
    fullUrl += `&format=${JSON_FORMAT_SHORT}`;
    fullOptions.headers.Accept = JSON_FORMAT;
  } else {
    fullUrl += `&format=${XML_FORMAT_SHORT}`;
    fullOptions.headers.Accept = XML_FORMAT;
  }
  return DO_CALL('GET', fullUrl, fullOptions, callback);
}

function doHttpRequestP1b(url, httpOptions, query, namedGraph, preferJSON, callback) {
  // console.log("profile P1b", url, query, namedGraph, httpOptions, preferJSON);
  const fullUrl = url;
  const fullOptions = { ...httpOptions, timeout: TIMEOUT };

  fullOptions.params = {
    query,
  };
  if (namedGraph) {
    fullOptions.params['default-graph-uri'] = namedGraph;
  }

  fullOptions.headers = { ...COMMON_HEADERS};
  if (preferJSON) {
    fullOptions.params.format = JSON_FORMAT_SHORT;
    fullOptions.headers.Accept = JSON_FORMAT;
  } else {
    fullOptions.params.format = XML_FORMAT_SHORT;
    fullOptions.headers.Accept = XML_FORMAT;
  }
  return DO_CALL('GET', fullUrl, fullOptions, callback);
}

function doHttpRequestP1c(url, httpOptions, query, namedGraph, preferJSON, callback) {
  // console.log("profile P1c", url, query, namedGraph, httpOptions, preferJSON);
  const fullUrl = url;
  const fullOptions = { ...httpOptions, timeout: TIMEOUT };

  fullOptions.params = {
    query
  };
  if (namedGraph) {
    fullOptions.params['default-graph-uri'] = namedGraph;
  }

  fullOptions.headers = { ...COMMON_HEADERS };
  // if (preferJSON) {
  // fullOptions.params['format'] = 'application%2Fsparql-results%2Bjson';
  fullOptions.params.format = XML_FORMAT;
  fullOptions.headers.Accept = XML_FORMAT;
  // } else {
  //     fullOptions.params['format'] = XML_FORMAT_SHORT;
  //     fullOptions.headers['Accept'] = XML_FORMAT;
  // }
  return DO_CALL('GET', fullUrl, fullOptions, callback);
}

function doHttpRequestP2(url, httpOptions, query, namedGraph, preferJSON, callback) {
  // console.log("profile P2", url, query, namedGraph, httpOptions, preferJSON);
  const fullUrl = url;
  const fullOptions = { ...httpOptions, timeout: TIMEOUT };
  fullOptions.headers = {
    ...COMMON_HEADERS,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  fullOptions.content = `query=${encodeQueryForUrl(query)}`;
  // fullOptions.content = `query=${encodeQueryForBody(query)}`;
  // fullOptions.content = `query=${query}`;
  if (namedGraph) {
    fullOptions.content += `&default-graph-uri=${encodeURIComponent(namedGraph)}`;
  }
  if (preferJSON) {
    fullOptions.content += `&format=${JSON_FORMAT_SHORT}`;
    fullOptions.headers.Accept = JSON_FORMAT;
  } else {
    fullOptions.content += `&format=${XML_FORMAT_SHORT}`;
    fullOptions.headers.Accept = XML_FORMAT;
  }
  return DO_CALL('POST', fullUrl, fullOptions, callback);
}

function doHttpRequestP2b(url, httpOptions, query, namedGraph, preferJSON, callback) {
  // console.log("profile P2b", url, query, namedGraph, httpOptions, preferJSON);
  const fullUrl = url;
  const fullOptions = { ...httpOptions, timeout: TIMEOUT};
  fullOptions.headers = {
    ...COMMON_HEADERS,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  fullOptions.params = {
    query: encodeQuery2(query),
    // query: query,
  };
  if (namedGraph) {
    fullOptions.params['default-graph-uri'] = namedGraph;
  }
  if (preferJSON) {
    fullOptions.params.format = JSON_FORMAT_SHORT;
    fullOptions.headers.Accept = JSON_FORMAT;
  } else {
    fullOptions.params.format = XML_FORMAT_SHORT;
    fullOptions.headers.Accept = XML_FORMAT;
  }
  return DO_CALL('POST', fullUrl, fullOptions, callback);
}

function doHttpRequestP3(url, httpOptions, query, namedGraph, preferJSON, callback) {
  // console.log("profile P3", url, query, namedGraph, httpOptions, preferJSON);
  let fullUrl = `${url}`;
  if (namedGraph) {
    fullUrl += `?default-graph-uri=${encodeURIComponent(namedGraph)}`;
  }
  const fullOptions = { ...httpOptions, timeout: TIMEOUT };
  fullOptions.headers = {
    ...COMMON_HEADERS,
    'Content-Type': 'application/sparql-query',
  };
  fullOptions.content = query;
  if (preferJSON) {
    fullUrl += `&format=${JSON_FORMAT_SHORT}`;
    fullOptions.headers.Accept = JSON_FORMAT;
  } else {
    fullUrl += `&format=${XML_FORMAT_SHORT}`;
    fullOptions.headers.Accept = XML_FORMAT;
  }
  return DO_CALL('POST', fullUrl, fullOptions, callback);
}

function doHttpRequestP4(url, httpOptions, query, namedGraph, preferJSON, callback) {
  // console.log("profile P4", url, query, namedGraph, httpOptions, preferJSON);
  let fullUrl = `${url}?query=${encodeQueryForUrl(query)}`;
  if (namedGraph) {
    fullUrl += `&default-graph-uri=${encodeURIComponent(namedGraph)}`;
  }
  const fullOptions = { ...httpOptions, timeout: TIMEOUT };
  fullOptions.headers = { ...COMMON_HEADERS };
  if (preferJSON) {
    fullUrl += `&format=${JSON_FORMAT_SHORT}`;
    fullOptions.headers.Accept = JSON_FORMAT;
  } else {
    fullUrl += `&format=${XML_FORMAT_SHORT}`;
    fullOptions.headers.Accept = XML_FORMAT;
  }
  return DO_CALL('POST', fullUrl, fullOptions, callback);
}

const PROFILE_MAP = {
  P1: doHttpRequestP1,
  P1b: doHttpRequestP1b,
  P1c: doHttpRequestP1c,
  P2: doHttpRequestP2,
  P2b: doHttpRequestP2b,
  P3: doHttpRequestP3,
  P4: doHttpRequestP4,
};

const DEFAULT_PROFILE_NAME = 'P2'; // <-- change here to switch the default profile for http requests
const DEFAULT_PROFILE = PROFILE_MAP[DEFAULT_PROFILE_NAME];

function selectHttpRequestProfileByName(name) {
  if (!name) return DEFAULT_PROFILE;
  if (PROFILE_MAP[name]) {
    console.log(`Profile ${name} selected`);
    return PROFILE_MAP[name];
  }
  console.log(`Default profile ${DEFAULT_PROFILE_NAME} selected`);
  return DEFAULT_PROFILE;
}

// use the specified profile for matching endpoint(s)
const SITE_SPECIFIC_PROFILES = [
  { pattern: 'wikidata.org', profileName: 'P1' },
  { pattern: 'scholarlydata.org', profileName: 'P4' },
  { pattern: 'digital-agenda-data.eu', profileName: 'P1c' },
  { pattern: 'data.nobelprize.org', profileName: 'P2b' },
];

function selectHttpRequestProfileNameByUrl(url) {
  const profile = SITE_SPECIFIC_PROFILES.find(x => url.includes(x.pattern));
  if (profile) return profile.profileName;

  return DEFAULT_PROFILE_NAME;
}

function selectHttpRequestProfile(options) {
  if (options && options.httpRequestProfileName) {
    return selectHttpRequestProfileByName(options.httpRequestProfileName);
  }
  const profileName = selectHttpRequestProfileNameByUrl(options.endPoint || options.endpoint); // TODO: vienādot rakstību
  return selectHttpRequestProfileByName(profileName);
}

// ---------------------

Meteor.methods({

  executeSparql(list) {
    const user_id = Meteor.userId();

    if (!is_project_member(user_id, list) && !is_public_diagram(list.diagramId)) {
      return null;
    }

    const { options } = list;
    if (!options || !options.params || !options.params.params || !options.params.params.query) {
      console.error('The query is empty – returning immediately');
      return { status: 500, error: 'The query is empty' };
    }

    let limit_set = false;
    let number_of_rows = 0;

    const authOptions = {};
    if (hasAuthInfo(options)) {
      authOptions.auth = makeAuthString(options);
    }

    // requestFunction(url, httpOptions, query, namedGraph="", preferJSON = false, callback = null);
    const HTTP_REQUEST_FN = selectHttpRequestProfile(options);

    const currentTime = new Date();
    const sparql_log_entry = {
      ...list,
      user: user_id,
      date: currentTime.toLocaleDateString(),
      time: currentTime.toLocaleTimeString(),
    };

    if (!options.paging_info) {
      // let's try to determine the number of rows in the result
      try {
        // clone object. It is an efficient hack
        const count_options = JSON.parse(JSON.stringify(options));

        // inserting SELECT COUNT before the first occurence of SELECT
        console.log('👽', count_options.params.params.query);
        // let query = count_options.params.params.query.toLowerCase().includes(' limit ')
        const query = /([\n\s])+limit([\n\s])+/i.test(count_options.params.params.query)
          ? buildEnhancedQuery(count_options.params.params.query, 'SELECT', ' SELECT (COUNT(*) as ?number_of_rows_in_query_xyz) WHERE { ', '}')
          : buildEnhancedQuery(count_options.params.params.query, 'SELECT', ' SELECT (COUNT(*) as ?number_of_rows_in_query_xyz) WHERE { ', '  LIMIT 10000 }');

        const namedGraph = count_options.params.params['default-graph-uri'];

        const httpOptions = { ...authOptions };
        // let httpOptions = Object.assign({}, count_options.params, authOptions); // ?? vai count_options.params var saturēt ko noderīgu?

        const qres = HTTP_REQUEST_FN(count_options.endPoint, httpOptions, query, namedGraph, true);

        if (qres.statusCode === 200) {
          const content = JSON.parse(qres.content);
          number_of_rows = content.results.bindings[0].number_of_rows_in_query_xyz.value;
          sparql_log_entry.successfull = true;
          if (number_of_rows > 50) {
            options.params.params.query = buildEnhancedQuery(
              options.params.params.query,
              'SELECT',
              'SELECT * WHERE {',
              '} LIMIT 50',
            );
            limit_set = true;
          }
        }
      } catch (ex) {
        // ERROR - pass the original SPARQL to the server
        sparql_log_entry.successfull = false;
        sparql_log_entry.error_message = ex;
        console.error(ex);

        options.params.params.query = buildEnhancedQuery(
          options.params.params.query,
          'SELECT',
          'SELECT * WHERE {',
          '} LIMIT 50',
        );
        limit_set = true;
      }
    } else if (!options.paging_info.download) {
      options.params.params.query = buildEnhancedQuery(
        options.params.params.query,
        'SELECT',
        'SELECT * WHERE {',
        `} OFFSET ${options.paging_info.offset} LIMIT ${options.paging_info.limit}`,
      );
      limit_set = true;
      number_of_rows = options.paging_info.number_of_rows;
    } else {
      // Do not change query
      // Since no refresh is intended = no additional parameters required
    }

    sparql_log_entry.number_of_rows = number_of_rows;
    add_sparql_log(sparql_log_entry);

    const Future = Npm.require('fibers/future');
    const future = new Future();

    try {
      // to modify endpoint by adding URL encoded querry
      const { query } = options.params.params;
      const namedGraph = options.params.params['default-graph-uri'];

      // query = encodeQuery(query);
      // options.endPoint = options.endPoint + '?'+ 'default-graph-uri=' + namedGraph +'&query=' + query;

      const httpOptions = { ...authOptions };
      // let httpOptions = Object.assign({}, options.params, authOptions);

      HTTP_REQUEST_FN(options.endPoint, httpOptions, query, namedGraph, false, (err, resp) => {
        if (err) {
          future.return({
            status: 505,
            error: err,
            limit_set: false,
            number_of_rows: 0,
          });
        }

        if (resp.statusCode !== 200) {
          if (resp.headers['content-type'].toLowerCase().startsWith('text')) {
            let error_message = resp.content;
            if (error_message.length > 514) error_message = error_message.substring(0, 514) + "...";
            future.return({ status: 504, error: resp.content, limit_set: false, number_of_rows: 0 });
          } else {
            future.return({ status: 504, error: 'bad response from the endpoint', limit_set: false, number_of_rows: 0 })
          }
        }

        // 200
        if (resp.headers['content-type'].toLowerCase().startsWith('application/json')) {
          try {
            // TODO: saskaņot JSON un XML formātu apstrādi; šobrīd JSON netiks saprasts
            const json_res = { sparql: JSON.parse(resp.content) };
            if (limit_set) {
              if (options.paging_info) {
                json_res.limit = 50;
                json_res.offset = options.paging_info.offset + 50;
              } else {
                json_res.limit = 50;
                json_res.offset = 50;
              }
            }
            json_res.limit_set = limit_set;
            json_res.number_of_rows = number_of_rows;
            future.return({ status: 200, result: json_res });
          } catch (err2) {
            future.return({
              status: 504,
              error: new Error('Unable to parse JSON response'),
              limit_set: false,
              number_of_rows: 0,
            });
          }
        } else {
          xml2js.parseString(resp.content, (json_err, json_res) => {
            if (json_err) {
              future.return({
                status: 504,
                error: json_err,
                limit_set: false,
                number_of_rows: 0,
              });
            }

            const result = {
              ...json_res,
              limit_set,
              number_of_rows,
            };

            if (limit_set) {
              if (options.paging_info) {
                result.limit = 50;
                result.offset = options.paging_info.offset + 50;
              } else {
                result.limit = 50;
                result.offset = 50;
              }
            }
            future.return({ status: 200, result });
          });
        }
      });
    } catch (ex) {
      future.return({
        status: 503,
        ex,
        limit_set: false,
        number_of_rows: 0,
      });
    }

    return future.wait();
  },

  testProjectEndPointOld(options) {
    const user_id = Meteor.userId();
    if (!is_project_member(user_id, options)) return;

    console.log('in test endpoint');
    // console.log("options:", options);

    if (!options.endpoint) {
      console.error('No data specified');
      return { status: 500, };
    }

    const HTTP_REQUEST_FN = selectHttpRequestProfile(options);

    const Future = Npm.require('fibers/future');
    const future = new Future();

    let httpOptions = {};

    if (hasAuthInfo(options)) {
      httpOptions = { auth: makeAuthString(options) }
    }

    let testResults = {};

    for (let profile of ['P1', 'P2', 'P3', 'P4']) {
      console.log('trying profile', profile);
      let fn = selectHttpRequestProfileByName(profile);

      try {
        let resp = fn(options.endpoint, httpOptions, ENDPOINT_TEST_QUERY, options.uri, false);
        let ct = detectContentType(resp.content);
        testResults[profile] = ct;
        if (ct === 'xml') {
          let xml = xml2js.parseStringSync(resp.content);
        }
      } catch (e) {
        testResults[profile] = "fail";
      }
    }

    console.log(testResults);
    return { 
      status: 200,
    };
  },

  testProjectEndPoint(options) {
    const user_id = Meteor.userId();
    if (!is_project_member(user_id, options)) return null;

    console.log('in test endpoint');
    console.log('options:', options);

    if (!options.endpoint) {
      console.error('No data specified');
      return {
        status: 500,
      };
    }

    const HTTP_REQUEST_FN = selectHttpRequestProfile(options);

    const Future = Npm.require('fibers/future');
    const future = new Future();

    const httpOptions = {};

    if (hasAuthInfo(options)) {
      httpOptions.auth = makeAuthString(options);
    }

    // httpOptions.timeout = 100;
    // let x = setTimeout(() => {
    //     console.log('timeout in endpoint test');
    //     future.return({status: 408});
    // }, 3000);

    HTTP_REQUEST_FN(options.endpoint, httpOptions, ENDPOINT_TEST_QUERY, options.uri, false, (err, resp) => {
      if (err) {
        console.log(err);
        if (err.response.statusCode === 401) {
          future.return({ status: 401, });
        } else {
          future.return({ status: 500, });
        }
      } else {
        xml2js.parseString(resp.content, (json_err, json_res) => {
          if (json_err) {
            console.log(json_err);
            future.return({ status: 500, });
          } else {
            future.return({ status: 200, });
          }
        });
      }
    });

    return future.wait();
  },

});
