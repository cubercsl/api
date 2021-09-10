import os
import requests

from flask import Flask, Response, request
app = Flask(__name__)

CF_API = os.getenv('CF_API', 'https://codeforces.com/api/user.info')
SHIELD_API = os.getenv('SHIELD_API', 'https://shields.io/badge')

rating_colors = {
    "Legendary Grandmaster": "ff0000",
    "International Grandmaster": "ff0000",
    "Grandmaster": "ff0000",
    "International Master": "ff8c00",
    "Master": "ff8c00",
    "Candidate Master": "aa00aa",
    "Expert": "0000ff",
    "Specialist": "03a89e",
    "Pupil": "008000",
    "Newbie": "808080",
    "Unrated": "000000"
}


def process_image(handle, rank, color, rating, style, link=False):
    def escapeahandle(username):
        return username.replace('-', '--').replace('_', '__')

    data = dict(cacheSeconds=86400, logo='Codeforces', style=style)
    if link:
        data['link'] = f'https://codeforces.com/profile/{handle}'

    rating_str = f'{rank} {rating}' if rating else str(rank)
    url = f'{SHIELD_API}/{escapeahandle(handle)}-{rating_str}-{color}.svg'

    r = requests.get(url, params=data)
    print(r.url)
    return r.content


def get_user_data(handle):
    data = dict(handles=handle)
    r = requests.get(CF_API, params=data)
    return r.json()


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET'])
def get(path):
    user = request.args.get('user', '').strip()
    style = request.args.get('style', '').strip()
    if user == '':
        return Response(process_image('404', 'user not found', 'critical', None, style),
                        mimetype="image/svg+xml", status=404)
    try:
        data = get_user_data(user)
    except Exception as e:
        return Response(process_image('500', 'internal server error', 'critical', None, style),
                        mimetype="image/svg+xml", status=500)
    if data.get('status') != 'OK' or len(data.get('result', [])) < 1:
        return Response(process_image('404', 'user not found', 'critical', None, style),
                        mimetype="image/svg+xml", status=404)

    handle = data['result'][0]['handle']
    rating = data['result'][0].get('rating', '')
    rank = data['result'][0].get('rank', "unrated").title()
    color = rating_colors[rank]
    return Response(process_image(handle, rank, color, rating, style, True),
                    mimetype="image/svg+xml",
                    headers={'Cache-Control': 's-maxage=86400'})


@app.errorhandler(405)
def method_not_allowed(e):
    return Response(process_image('405', 'method not allowed', 'critical', None, ''),
                    mimetype="image/svg+xml", status=405)


if __name__ == "__main__":
    app.run(debug=True)
