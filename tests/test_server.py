import unittest
from app import app


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_server_only_serves_the_app(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)
        self.assertIn('vendor/zxcvbn.js', html)
        self.assertIn('password-check.js', html)
        self.assertEqual(self.client.post('/analyze', json={'password':'test'}).status_code, 404)

    def test_privacy_headers_and_local_assets(self):
        response = self.client.get('/')
        self.assertEqual(response.headers['Cache-Control'], 'no-store')
        csp = response.headers['Content-Security-Policy']
        self.assertIn("script-src 'self'", csp)
        self.assertIn('https://api.pwnedpasswords.com', csp)
        self.assertNotIn('unsafe-inline', csp)
        for path in ('/static/app.js','/static/password-check.js','/static/vendor/zxcvbn.js'):
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200)
            response.close()


if __name__ == '__main__':
    unittest.main()
