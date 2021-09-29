import json
from pathlib import Path
from dash import html
from dash import dcc
from dash.html.Div import Div

def read_languages():

    languages = []

    for p in Path('.').glob('Languages/*.json'):
        languages.append({'label':f"{p.name}"[0:-8], 'value':f"{p.name}"[-7:-5]})

    return languages

# ------------------------------------------Language-------------------------------------------------

Front = html.Div(className='body',
    children=[

        html.Div(className='language_drop',
            children=[
                dcc.Dropdown(
                id='language-dropdown',
                optionHeight= 60,
                options=read_languages(),
                value='Sp'),
            ]),

            # ------------------------------------Title--------------------------------------------
            html.Div(className ='app-header',
                children=[html.H1("Password Manager")]),

            # ------------------------------------Output-Message--------------------------------------------
            html.Div(id='my-output'),

            # ------------------------------------Inputs--------------------------------------------
            html.Div(className= 'grid-container',
            children=[
                html.Div(className= 'input-name', children=['User: ']),
                html.Div(className= 'input-box',
                children=[
                    dcc.Input(id='Name-input', value='', type='text'),
                    ]),

                html.Div(className= 'input-name', children=['Password: ']),
                html.Div(className= 'input-box',
                    children=[
                        dcc.Input(id='password-input', value='', type='password'),
                        ])
            ]),
            # -------------------------------------Button-------------------------------------------
            html.Div(className='button-container', id='b-container-1',
            children=[html.Button('submit', className='button', id='btn-nclicks-1', n_clicks=0)]),

            # -------------------------------------Register-------------------------------------------
            html.Div(className= 'span-text', children=["Doesn't have an account yet?"]),

            html.Div(className='button-container',
            children=[html.Button('Register', className='button', id='btn-nclicks-2', n_clicks=0)]),
    ])