# Skrypt generujacy statystyki katedr z BADAP AGH

Ze względu na ograniczenia w możliwości podglądu punktów ministerialnych do dzialania wymaga uprawnień 'Kierownika jednostki'.
Po zalogowaniu się w przeglądarce należy zmieniń role na "Kierownik jednostki", odświeżyć stronę oraz skopiować wartości z cookies do pliku `.env` wg wzoru w `.env.sample`

## Uruchomienie

Testowane w Python 3.12.3. Zależności instalowane przez poetry.

```bash
poetry install
poetry run python badap_stats/app.py
```
