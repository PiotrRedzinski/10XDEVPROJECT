# Dokument wymagań produktu (PRD) - Fiszki Edukacyjne
## 1. Przegląd produktu
Opis:
Platforma umożliwia efektywne tworzenie fiszek edukacyjnych zarówno przez automatyczną generację za pomocą AI, jak i ręczne tworzenie. System wspiera metodę spaced repetition poprzez integrację z gotowym algorytmem powtórek. Produkt jest dedykowany użytkownikom, którzy poszukują prostego narzędzia do nauki oraz efektywnego zarządzania fiszkami w interfejsie webowym.

## 2. Problem użytkownika
Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne i zniechęca użytkowników do stosowania metody spaced repetition. Użytkownicy potrzebują narzędzia, które uprości ten proces i zwiększy produktywność nauki.

## 3. Wymagania funkcjonalne
- Generowanie fiszek przez AI na podstawie wprowadzonego tekstu (kopiuj-wklej).
- Manualne tworzenie fiszek.
- Przeglądanie, edycja i usuwanie fiszek.
- System logowania oparty na nazwie użytkownika i haśle (bez ograniczeń dotyczących długości hasła).
- Walidacja pól fiszki:
  - Przód: maks. 220 znaków.
  - Tył: maks. 500 znaków.
  - W przypadku przekroczenia limitu, system wyświetla komunikat zawierający wyłącznie dozwoloną liczbę znaków.
- Akceptacja fiszek generowanych przez AI poprzez przyciski "akceptuj", "edytuj" i "odrzuć".
- Minimalistyczny interfejs edycji:
  - Umożliwia tylko modyfikację pól "przód" i "tył".
  - Dane są automatycznie odświeżane z bazy przy kliknięciu przycisku edycji.
- Logowanie metryk w tle:
  - Rejestrowanie w formacie: czas generowania, liczba fiszek, liczba zatwierdzonych fiszek, liczba odrzuconych fiszek, gdzie wartości są oddzielone przecinkami.
- Algorytm dzielący tekst:
  - Przetwarza tekst o długości od 1000 do 10000 znaków.
  - Zapewnia tematyczną spójność wygenerowanych fiszek.
- Integracja z gotowym algorytmem powtórek.

## 4. Granice produktu
- Brak własnego, zaawansowanego algorytmu powtórek (np. SuperMemo, Anki).
- Brak importu plików z wielu formatów (PDF, DOCX, itp.).
- Brak możliwości współdzielenia zestawów fiszek między użytkownikami.
- Brak integracji z innymi platformami edukacyjnymi.
- Produkt dostępny wyłącznie jako aplikacja webowa (bez aplikacji mobilnych).
- Pominięcie dodatkowych zabezpieczeń danych i przeprowadzania testów penetracyjnych lub audytów bezpieczeństwa w MVP.
- Brak funkcjonalności historii zmian w edycji fiszek.

## 5. Historyjki użytkowników
### US-001: Rejestracja i logowanie
- Tytuł: Rejestracja i logowanie użytkowników
- Opis: Użytkownik rejestruje się oraz loguje do systemu przy użyciu nazwy i hasła. System nie posiada zaawansowanych zabezpieczeń, a komunikaty o błędach są ograniczone do "brak konta" oraz "błędne hasło".
- Kryteria akceptacji:
  - Użytkownik może utworzyć konto.
  - Podczas logowania, przy błędnych danych, wyświetlane są komunikaty: "brak konta" lub "błędne hasło".

### US-002: Generowanie fiszek przez AI
- Tytuł: Automatyczne generowanie fiszek z tekstu
- Opis: Użytkownik wkleja tekst edukacyjny, a system generuje fiszki przy użyciu AI. Fiszki zawierają pola "przód" (maks. 220 znaków) i "tył" (maks. 500 znaków) z walidacją limitu znaków.
- Kryteria akceptacji:
  - Użytkownik wkleja tekst, a system generuje fiszki.
  - Pola spełniają ograniczenia dotyczące długości.
  - W przypadku przekroczenia limitu znaków, wyświetlany jest komunikat z informacją o dopuszczalnej liczbie znaków.

### US-003: Akceptacja/odrzucanie fiszek generowanych przez AI
- Tytuł: Ocena fiszek generowanych przez AI
- Opis: Użytkownik przegląda wygenerowane fiszki i ocenia je, klikając przyciski "akceptuj", "edytuj" lub "odrzuć".
- Kryteria akceptacji:
  - Użytkownik ma możliwość oceny każdej fiszki poprzez przyciski "akceptuj", "edytuj" i "odrzuć".
  - Decyzja użytkownika jest zapisywana i wpływa na metryki.

### US-004: Ręczne tworzenie fiszek
- Tytuł: Manualne tworzenie fiszek
- Opis: Użytkownik tworzy fiszki ręcznie, wprowadzając zawartość pól "przód" i "tył". System stosuje walidację długości pól.
- Kryteria akceptacji:
  - Użytkownik może tworzyć fiszki ręcznie.
  - Walidacja ograniczeń znaków działa poprawnie.

### US-005: Edycja fiszek
- Tytuł: Edycja fiszek
- Opis: Użytkownik edytuje istniejące fiszki (zarówno wygenerowane przez AI, jak i utworzone ręcznie) przez minimalistyczny interfejs umożliwiający modyfikację tylko pól "przód" i "tył". Dane są automatycznie odświeżane z bazy przy kliknięciu przycisku edycji.
- Kryteria akceptacji:
  - Użytkownik może edytować fiszki.
  - Interfejs edycji pokazuje wyłącznie pola "przód" i "tył".
  - Dane są odświeżane przy kliknięciu przycisku edycji.

### US-006: Przeglądanie i usuwanie fiszek
- Tytuł: Zarządzanie fiszkami (przeglądanie i usuwanie)
- Opis: Użytkownik przegląda listę fiszek i może usuwać wybrane fiszki.
- Kryteria akceptacji:
  - Użytkownik widzi listę fiszek.
  - Użytkownik może usunąć wybraną fiszkę, a zmiany są natychmiast widoczne.

### US-007: Dzielenie tekstu na segmenty
- Tytuł: Przetwarzanie tekstu dla generacji fiszek
- Opis: System dzieli wprowadzony tekst (1000-10000 znaków) na segmenty, zapewniając tematyczną spójność wygenerowanych fiszek.
- Kryteria akceptacji:
  - Tekst jest podzielony na segmenty odpowiadające logice tematycznej.
  - Fiszki wygenerowane z poszczególnych segmentów są spójne tematycznie.

## 6. Metryki sukcesu
- 75% fiszek generowanych przez AI jest akceptowane przez użytkownika.
- Użytkownicy tworzą 75% fiszek przy użyciu funkcji generacji AI.
- System rejestruje następujące metryki (zapisywane w tle): czas generowania, liczba fiszek, liczba zatwierdzonych fiszek, liczba odrzuconych fiszek, procent zaakceptowanych fiszek wygnerowanych przez AI (wartości oddzielone przecinkami). 