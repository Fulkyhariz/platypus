import http from 'k6/http';

export const options = {
    // Key configurations for avg load test in this section
    vus: 100,
    duration: '60s',
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.99)', 'count'],
  };

export default function () {
  const url = 'localhost';
  const payload = JSON.stringify({
    email : 'carmen43',
    password : 'User123412!!'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json'
    },
};
  http.get(url,params, payload);
}