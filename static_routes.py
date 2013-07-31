from app import app
from bottle import static_file

@app.route('/static/:path')
def static(path):
    return static_file(path, root='static/')

@app.route('/css/:path')
def css(path):
    return static_file(path, root='css/')

@app.route('/js/:path')
def js(path):
    return static_file(path, root='js/')

@app.route('/img/:path')
def js(path):
    return static_file(path, root='img/')

