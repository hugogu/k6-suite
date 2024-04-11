import http from 'k6/http';
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.0.0/index.js";
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '3m30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 0 },
    ],
};

export default function() {
    let params = {
        headers: {
            'X-Request-ID': uuidv4().toString()
        },
    };

    let res = http.get('http://localhost:8080/hello', params);
    check(res, {
        'status was 200': r => r.status === 200,
        'not found': r => r.status === 404,
        'invalid': r => r.status === 400,
        'client error': r => r.status > 400 && r.status < 500,
        'server error': r => r.status >=500
    });
    sleep(0.05)
}
