import datetime

def formatDate(date):
    return datetime.datetime.strptime(date, "%d/%m/%Y").strftime('%Y-%m-%d')


