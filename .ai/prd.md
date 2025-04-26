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
## US-001: Bezpieczny dostęp i uwierzytelnianie

- Tytuł: Bezpieczny dostęp
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - bez zalogowania otwiera się tylko strona główna na której użytkownik może klinąć przycisk zaloguj
  - Użytkownik NIE MOŻE korzystać z funkcji generowania fiszek i oglądania fiszek bez logowania się do systemu.
  - Użytkownik może logować się do systemu poprzez przycisk zaloguj  po prawej stronie w górnym menu.
  - Użytkownik może się wylogować z systemu poprzez ostatni przycisk po prowej stronie w górnym menu.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

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

## US-008: Kolekcje reguł

- Tytuł: Kolekcje reguł
- Opis: Jako użytkownik chcę móc zapisywać i edytować zestawy reguł, aby szybko wykorzystywać sprawdzone rozwiązania w różnych projektach.
- Kryteria akceptacji:
  - Użytkownik może zapisać aktualny zestaw reguł (US-001) jako kolekcję (nazwa, opis, reguły).
  - Użytkownik może aktualizować kolekcję.
  - Użytkownik może usunąć kolekcję.
  - Użytkownik może przywrócić kolekcję do poprzedniej wersji (pending changes).
  - Funkcjonalność kolekcji nie jest dostępna bez logowania się do systemu (US-004).

## US-009: Bezpieczny dostęp i uwierzytelnianie

- Tytuł: Bezpieczny dostęp
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik MOŻE korzystać z tworzenia reguł "ad-hoc" bez logowania się do systemu (US-001).
  - Użytkownik NIE MOŻE korzystać z funkcji Kolekcji bez logowania się do systemu (US-003).
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

## 6. Metryki sukcesu
- 75% fiszek generowanych przez AI jest akceptowane przez użytkownika.
- Użytkownicy tworzą 75% fiszek przy użyciu funkcji generacji AI.
- System rejestruje następujące metryki (zapisywane w tle): czas generowania, liczba fiszek, liczba zatwierdzonych fiszek, liczba odrzuconych fiszek, procent zaakceptowanych fiszek wygnerowanych przez AI (wartości oddzielone przecinkami). 

