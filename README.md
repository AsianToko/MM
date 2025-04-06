# MM

Movie Matching website

# Project Setup

## Vereisten

- Node.js geïnstalleerd op je systeem
- Een API-sleutel van [The Movie Database (TMDB)](https://www.themoviedb.org/)

## Installatie

1. **Repository klonen via VS Code**

   - Open VS Code.
   - Ga naar de explores als je een nieuw project begint dan zal je kunnen kiezen tussen map op clone repository.
   - Klik op "Clone Repository".
   - Plak de link https://github.com/AsianToko/MM.git in je vs code en dan zou je het project moeten zien.

2. **Dependencies installeren**

   - Open een terminal in VS Code .
   - Voer het volgende commando uit:

     npm install

3. **API-sleutel instellen**

   - Maak een .env bestand in de root van het project.
   - Voeg de volgende regel toe met je eigen TMDB API-sleutel:
     env
     TMDB_BEARER_TOKEN=your_api_key_here

4. **Project starten**

   - Start de applicatie met het volgende commando:

     npm start

   - De applicatie draait nu op `http://localhost:4000`.

## Functionaliteiten

- Trending films bekijken
- Films die nu draaien bekijken
- Aanbevelingen op basis van genres
- Registreren en inloggen
- Films opslaan in je account

## Opmerking

Zorg ervoor dat je een geldige API-sleutel hebt van TMDB, anders werkt de applicatie niet correct.

## In de toekomst
voor de toekomst willen we nog een funtie toevoegen om vrienden te worden met andere mensen zodat je kan zien waar iemands intresses liggen in films en zodat je mischien samen naar de film kan gaan

