# Architektura UI dla Fiszki Edukacyjne

## 1. Przegląd struktury UI

Interfejs użytkownika jest oparty na wspólnym, spójnym układzie, który wykorzystuje komponenty z shadcn/ui oraz Tailwind CSS. Głównym elementem nawigacyjnym jest dynamiczny top-bar, który w zależności od stanu sesji (zalogowany/niezalogowany) wyświetla odpowiednie opcje. UI składa się z widoków logowania/rejestracji, generowania fiszek, listy fiszek oraz (opcjonalnie) edycji fiszki – wszystko zaprojektowane z myślą o prostocie, dostępności i natychmiastowym feedbacku dla użytkownika.

## 2. Lista widoków

### 2.1. Widok Logowania/Rejestracji
- **Ścieżka widoku:** /login
- **Główny cel:** Umożliwienie użytkownikowi zalogowania się lub rejestracji w systemie przy użyciu jednego wspólnego formularza.
- **Kluczowe informacje do wyświetlenia:** Pole e-mail (pełniące rolę nazwy użytkownika) oraz pole hasła.
- **Kluczowe komponenty widoku:** Formularz logowania (pola e-mail i hasło), przyciski "Zaloguj" i "Zarejestruj", inline komunikaty o błędach.
- **UX, dostępność i względy bezpieczeństwa:** Prosty, minimalistyczny interfejs z natychmiastowym feedbackiem błędów i zabezpieczeniem danych (późniejsza integracja JWT).

### 2.2. Ekran Generowania Fiszek
- **Ścieżka widoku:** /generate
- **Główny cel:** Umożliwienie użytkownikowi generowania fiszek za pomocą AI przez wprowadzenie tekstu spełniającego wymagania długości (1000-10000 znaków).
- **Kluczowe informacje do wyświetlenia:** Pole tekstowe z placeholderem "Wprowadź tekst od długości od 1000 do 10000 znaków" oraz przycisk "Generuj Fiszki".
- **Kluczowe komponenty widoku:** Formularz do wprowadzania tekstu, przycisk uruchamiający proces generacji, inline komunikaty o błędach walidacji.
- **UX, dostępność i względy bezpieczeństwa:** Intuicyjny formularz z wyraźnymi komunikatami i walidacją na poziomie klienta.

### 2.3. Widok Listy Fiszek
- **Ścieżka widoku:** /flashcards
- **Główny cel:** Prezentacja wygenerowanych (oraz manualnie utworzonych) fiszek w formie siatki umożliwiającej natychmiastową interakcję.
- **Kluczowe informacje do wyświetlenia:** Fiszki rozmieszczone w siatce, gdzie każdy wiersz zawiera dokładnie trzy fiszki.
- **Kluczowe komponenty widoku:** Komponent karty fiszki z przyciskami "Zatwierdź", "Edytuj" i "Odrzuć"; opcje operacji grupowych (przyciski "Zatwierdź wszystkie" i "Odrzuć wszystkie").
- **UX, dostępność i względy bezpieczeństwa:** Spójny układ siatki, natychmiastowy feedback przy akcji, dostępność dla użytkowników desktopowych oraz mechanizmy inline wyświetlania błędów.

### 2.4. Widok Edycji Fiszki (Opcjonalny)
- **Ścieżka widoku:** /flashcards/:id/edit (lub edycja inline/modal w widoku listy fiszek)
- **Główny cel:** Umożliwienie użytkownikowi modyfikacji pól "przód" i "tył" fiszki.
- **Kluczowe informacje do wyświetlenia:** Aktualna treść fiszki, pola edycyjne dla "przodu" i "tyłu".
- **Kluczowe komponenty widoku:** Formularz edycji, przycisk zapisu zmian, mechanizm odświeżania danych z bazy, inline komunikaty o błędach.
- **UX, dostępność i względy bezpieczeństwa:** Minimalistyczny interfejs skupiony wyłącznie na edycji, zapewniający szybkie, jednozadaniowe operacje z widocznym feedbackiem.

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na stronę główną, gdzie widzi top-bar z opcją "Zaloguj" (dla niezalogowanych).
2. Po kliknięciu "Zaloguj", użytkownik przechodzi do widoku logowania/rejestracji, gdzie wprowadza e-mail oraz hasło.
3. Po pomyślnym logowaniu, top-bar dynamicznie zmienia się, wyświetlając dodatkowe opcje: moduł generowania fiszek, lista fiszek, nazwa użytkownika oraz opcję wyloguj.
4. Użytkownik klika opcję "Generuj Fiszki" w top-bar i przechodzi do ekranu generowania fiszek.
5. W ekranie generowania fiszek, użytkownik wkleja tekst spełniający wymagania długości i uruchamia proces generacji poprzez przycisk "Generuj Fiszki".
6. Po zakończeniu procesu generacji, użytkownik jest natychmiast przekierowywany do widoku listy fiszek, gdzie fiszki są wyświetlane w stałej, trójkolumnowej siatce.
7. Użytkownik może przeglądać fiszki, indywidualnie je zatwierdzać, edytować lub odrzucać, a także korzystać z operacji grupowych (zatwierdź/odrzuć wszystkie).
8. W przypadku wystąpienia błędów lub walidacji, użytkownik otrzymuje inline komunikaty przy odpowiednich komponentach.

## 4. Układ i struktura nawigacji

- **Top-Bar:** Główny element nawigacyjny widoczny na wszystkich widokach.
  - Dla niezalogowanych: Wyświetla nazwę aplikacji oraz opcję "Zaloguj".
  - Dla zalogowanych: Wyświetla nazwę aplikacji, linki do modułów (Generowanie fiszek, Lista fiszek), nazwę użytkownika oraz opcję "Wyloguj".
- **Nawigacja:** Użytkownik przechodzi między widokami poprzez kliknięcie odpowiednich linków w top-bar. Przykładowo:
  - Kliknięcie "Generuj Fiszki" przekierowuje bezpośrednio do ekranu generowania fiszek.
  - Kliknięcie "Lista fiszek" przenosi użytkownika do widoku siatki fiszek.
- **Przepływy akcji:** Operacje takie jak logowanie, generowanie fiszek czy edycja są zaprojektowane tak, aby zapewnić natychmiastowy feedback i minimalną liczbę kroków, redukując punkty tarcia użytkownika.

## 5. Kluczowe komponenty

- **TopBar:** Wspólny, dynamiczny element nawigacyjny odpowiedzialny za wyświetlanie opcji zgodnie z stanem sesji.
- **Formularz logowania/rejestracji:** Minimalistyczny układ z polami na e-mail i hasło, wraz z inline komunikatami o błędach.
- **Formularz generowania fiszek:** Pole tekstowe z wyraźnym placeholderem oraz przycisk do uruchomienia generacji. Walidacja wbudowana w formularz zapewnia zgodność z wymogami długości tekstu.
- **Fiszka Card:** Komponent prezentujący pojedynczą fiszkę, zawierający przyciski akcji (Zatwierdź, Edytuj, Odrzuć) dla indywidualnych operacji.
- **Grid Layout:** Stały układ siatki prezentujący fiszki w trzech kolumnach, niezależnie od zmiany rozmiaru okna, dostosowany do MVP na interfejs desktop.
- **Modal/Widok edycji:** Mechanizm umożliwiający edycję fiszki (pole przód i tyl), z mechanizmem odświeżania danych i inline komunikatami o błędach.
- **Komponenty komunikatów:** Elementy służące do wyświetlania inline błędów walidacji i innych komunikatów systemowych.
- **React Context oraz Hooki:** Mechanizm zarządzania stanem aplikacji, oddzielający stan sesji użytkownika od danych fiszek, zapewniający spójność i efektywność interakcji. 