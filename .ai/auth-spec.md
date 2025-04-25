# Specyfikacja modułu autoryzacji i logowania

## Wprowadzenie

Niniejszy dokument przedstawia szczegółową specyfikację modułu rejestracji, logowania, wylogowywania oraz odzyskiwania hasła użytkowników. Specyfikacja uwzględnia wymagania funkcjonalne zgodne z US-001, US-008 oraz US-009 z dokumentu PRD, a także integrację z wykorzystaniem technologii opisanych w dokumencie @tech-stack.md. Całość musi być zgodna z istniejącą architekturą aplikacji, nie naruszając dotychczasowego działania systemu.

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Ogólne założenia

- **Cel:** Zapewnienie intuicyjnego i bezpiecznego interfejsu do rejestracji, logowania, wylogowywania oraz odzyskiwania hasła.
- **Podejście:** Wykorzystanie Astro do generowania statycznych stron i React do dynamicznych komponentów. Przejrzysty podział na strony autoryzacji i strony dla użytkowników zalogowanych.

### 1.2. Rozdzielenie widoków i komponentów

- **Strony Astro (Server-Side Rendering):**
  - Utworzenie dedykowanych stron: `/register`, `/login`, `/reset-password`.
  - Strony te będą korzystać z layoutów, w których dynamicznie renderowane są komponenty React odpowiedzialne za formularze.
  - Layout ogólny będzie rozróżniał widok dla użytkowników autoryzowanych i nieautoryzowanych, umożliwiając dynamiczną zmianę menu (np. przycisk wylogowania dla zalogowanych, linki do logowania/rejestracji dla niezalogowanych).

- **Komponenty Client-Side (React):**
  - Formularz rejestracji: Zawiera pola takie jak email, hasło oraz potwierdzenie hasła. Walidacja w czasie rzeczywistym (poprawność formatu email, zgodność haseł, minimalna długość hasła).
  - Formularz logowania: Pola email oraz hasło. Komponent obsługuje komunikaty błędów typu "brak konta" lub "błędne hasło".
  - Formularz odzyskiwania hasła: Pole do wprowadzenia emaila, po którym wysyłany jest link do resetu hasła. Komponent wyświetla status operacji (sukces/niepowodzenie).

### 1.3. Walidacja i komunikaty błędów

- Walidacja po stronie klienta:
  - Sprawdzenie obowiązkowych pól (email, hasło itd.).
  - Weryfikacja formatu email i długości haseł.
  - Natychmiastowe informowanie użytkownika o błędach (np. "Niepoprawny format adresu email", "Hasła nie są zgodne").

- Walidacja po stronie serwera:
  - Dodatkowa kontrola danych wejściowych i zabezpieczenie przed przesłaniem nieprawidłowych lub złośliwych danych.

- Komunikaty błędów:
  - Precyzyjne komunikaty określające naturę błędu, np. "Brak konta", "Błędne hasło", "Email już istnieje".
  - Informacje zwrotne w formie alertów lub inline error messages w obrębie formularzy.

### 1.4. Obsługa scenariuszy

- **Scenariusze:**
  - **Rejestracja:** Użytkownik wprowadza dane, system waliduje dane, po poprawnej walidacji dane są przesyłane do backendu. W przypadku błędu, użytkownik widzi odpowiedni komunikat.
  - **Logowanie:** Użytkownik wprowadza dane, komponent wysyła zapytanie do API, system weryfikuje dane i tworzy sesję. W razie błędnych danych, wyświetlany jest błąd.
  - **Odzyskiwanie hasła:** Użytkownik wpisuje swój email, system wysyła link resetujący hasło. Użytkownik otrzymuje potwierdzenie o wysłaniu emaila.
  - **Wylogowanie:** Użytkownik wykonuje akcję wylogowania, co powoduje usunięcie danych sesji i przekierowanie do strony logowania.

---

## 2. LOGIKA BACKENDOWA

### 2.1. Struktura endpointów API

- **Rejestracja:**
  - Endpoint: `/src/pages/api/auth/register.ts`
  - Odpowiedzialny za przyjmowanie danych rejestracyjnych, walidację danych wejściowych oraz wywołanie metod Supabase Auth do tworzenia nowego użytkownika.

- **Logowanie:**
  - Endpoint: `/src/pages/api/auth/login.ts`
  - Przyjmuje dane logowania, weryfikuje je i na podstawie poprawności tworzy sesję użytkownika.

- **Wylogowanie:**
  - Endpoint: `/src/pages/api/auth/logout.ts`
  - Wywołuje metodę Supabase Auth do zakończenia sesji, czyści dane po stronie klienta oraz przekierowuje użytkownika do strony logowania.

- **Odzyskiwanie hasła:**
  - Endpoint: `/src/pages/api/auth/reset-password.ts`
  - Przyjmuje żądanie resetu hasła, inicjuje proces wysłania emaila resetującego i zwraca status operacji.

### 2.2. Modele danych i walidacja

- **Modele danych:**
  - Definicje typów użytkownika, np. interfejsy opisujące strukturę danych rejestracyjnych i logowania.
  - Schematy walidacji (np. za pomocą bibliotek walidacyjnych takich jak Zod) dla danych wejściowych.

- **Walidacja wejściowa:**
  - Każdy endpoint powinien wykonywać walidację danych przy użyciu wyżej wymienionych schematów.
  - Użycie mechanizmu early return w przypadku błędów walidacji z odpowiednimi kodami statusu HTTP (np. 400 – Bad Request, 401 – Unauthorized).

### 2.3. Obsługa wyjątków

- Implementacja mechanizmu przechwytywania wyjątków (try-catch) w każdym z endpointów.
- Rejestrowanie błędów w systemie logowania metryk, by monitorować np. liczbę nieudanych prób logowania.
- W przypadku krytycznych błędów – zwracanie komunikatów błędów zgodnych z zasadami bezpieczeństwa, nie ujawniając szczegółowych informacji technicznych użytkownikowi.

### 2.4. Integracja z renderowaniem stron

- Aktualizacja sposobu renderowania stron w Astro zgodnie z konfiguracją w `@astro.config.mjs`, uwzględniając obsługę sesji i przekazywanie danych autoryzacyjnych.
- Middleware Astro ma odczytywać stan sesji użytkownika i odpowiednio przekierowywać w przypadku próby dostępu do stron wymagających autoryzacji.

---

## 3. SYSTEM AUTENTYKACJI

### 3.1. Wykorzystanie Supabase Auth

- **Rejestracja:**
  - Użytkownik przesyła dane (email, hasło) do endpointu rejestracji, który wywołuje funkcję Supabase Auth tworzącą nowe konto.
  - Supabase zarządza przechowywaniem danych, weryfikacją unikalności emaila oraz generowaniem tokenów weryfikacyjnych.

- **Logowanie:**
  - Endpoint logowania przyjmuje dane użytkownika i weryfikuje je przy użyciu Supabase Auth.
  - W przypadku poprawnej weryfikacji, system tworzy sesję, zapisuje token (w cookies lub w local storage) i ustawia odpowiedni stan w aplikacji.

- **Wylogowanie:**
  - Wywołanie metody Supabase Auth odpowiedzialnej za zakończenie sesji, co skutkuje usunięciem tokena i odświeżeniem stanu aplikacji.

- **Odzyskiwanie hasła:**
  - Użytkownik inicjuje żądanie resetu hasła poprzez podanie adresu email.
  - Supabase Auth wysyła email z linkiem do resetu hasła, umożliwiając użytkownikowi zmianę hasła.

### 3.2. Integracja z Astro i React

- **Middleware i ochrona routingu:**
  - W momencie renderowania stron, middleware Astro odczytuje stan sesji użytkownika, zabezpieczając strony dostępne tylko dla użytkowników autoryzowanych.
  - Strony logowania oraz rejestracji dostępne są dla użytkowników nieautoryzowanych, a po autoryzacji następuje przekierowanie do strefy chronionej.
  - **Kolekcje reguł:** Dostęp do funkcji Kolekcji reguł (US-008) jest ograniczony do użytkowników uwierzytelnionych, co jest egzekwowane przez middleware Astro.

- **Kontrakty i typy danych:**
  - Ustalone kontrakty danych dla komunikacji między frontem a backendem, określające struktury request i response.
  - Wprowadzenie typów (np. TypeScript interfaces) dla spójności oraz lepszej obsługi błędów.

### 3.3. Bezpieczeństwo i logowanie metryk

- Podwójna walidacja: zarówno po stronie klienta (React), jak i po stronie serwera (API endpointy).
- Zabezpieczenie tokenów sesyjnych, stosowanie bezpiecznych mechanizmów przechowywania (httpOnly cookies, tokeny JWT, itp.).
- Monitorowanie zdarzeń autoryzacji: logowanie metryk (np. czas logowania, liczba nieudanych prób) dla celów analitycznych i bezpieczeństwa.

---

## Podsumowanie

- System autoryzacji został zaprojektowany jako modularna warstwa, która integruje Astro (SSR), React (komponenty dynamiczne) oraz Supabase Auth (backend). 
- Kluczowe aspekty to: przejrzystość interfejsu, rygorystyczna walidacja danych, obsługa wyjątków oraz wysoki poziom bezpieczeństwa.
- Architektura umożliwia łatwe rozszerzanie funkcjonalności (np. w ramach US-008 dotyczącego kolekcji reguł) przy zachowaniu spójności z istniejącą strukturą aplikacji.

Niniejsza specyfikacja stanowi wytyczne do implementacji modułu rejestracji, logowania, wylogowania i odzyskiwania hasła użytkowników, gwarantując zgodność z wymaganiami biznesowymi oraz technologicznymi projektu. 