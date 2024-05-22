# Skrypt generujacy statystyki katedr z BADAP AGH

Ze względu na ograniczenia w możliwości podglądu punktów ministerialnych do dzialania wymaga uprawnień 'Kierownika jednostki'.
Po zalogowaniu się w przeglądarce należy zmieniń role na "Kierownik jednostki", odświeżyć stronę oraz skopiować wartości z cookies do pliku `.env` wg wzoru w `.env.sample`

## Uruchomienie

Testowane w Python 3.12.3. Zależności instalowane przez poetry.

```bash
poetry install
poetry run python badap_stats/app.py
```

# Punktoza
Jako obejście problemu związane z brakiem możliwości pobrania punktów ministerialnych z API, skrypt korzysta z danych serwisu https://punktoza.pl/ zamieszczonych w postaci pliku punktoza.json.
Wszukiwanie odbywa się na podstawie DOI artykułu. Nie wszystkie artykuły w bazie BADAP posiadają jednak DOI, a część wpisów jest nieaktualna lub błędna, dlatego wyniki mogą być niepełne lub niepoprawne.
