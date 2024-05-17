
# python3 manage.py startapp XXX app name
# python3 manage.py makemigrations
# python3 manage.py migrate

# pipenv shell
clear
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver 