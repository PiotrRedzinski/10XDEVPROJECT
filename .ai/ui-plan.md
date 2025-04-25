# Architektura UI dla Fiszki Edukacyjne

## 1. Przegląd struktury UI

W architekturze UI produktu "Fiszki Edukacyjne" integrujemy widok logowania w głównej strukturze interfejsu oraz zapewniamy zestaw kluczowych widoków do zarządzania fiszkami. Aplikacja bazuje na stałym menu nawigacyjnym (Navigation Menu) z komponentów Shadcn/ui, co umożliwia łatwą nawigację między dashboardem, widokami szczegółowymi, edycji, generacji AI oraz  zatwierdzania/odrzucania fiszek. Zarządzanie stanem odbywa się przy użyciu React, a autoryzacja oparta jest na JWT dla zapewnienia bezpieczeństwa komunikacji z API. Responsywność jest zapewniona przez bilbiotekę Tailwind CSS.

## 2. Lista widoków

### Widok Główny / Logowanie (wbudowane)
- Nazwa widoku: Logowanie (wbudowane)
- Ścieżka widoku: `/` (strona główna)
- Główny cel: Umożliwić użytkownikowi zalogowanie się oraz prezentację formularza logowania dla niezautoryzowanych użytkowników.
- Kluczowe informacje do wyświetlenia: Formularz logowania (pola: username, password), komunikaty walidacyjne oraz ewentualne błędy uwierzytelniania.
- Kluczowe komponenty widoku: Formularz logowania, komunikaty o błędach inline, Navigation Menu, przejście do Rejestracja
- UX, dostępność i względy bezpieczeństwa: Intuicyjny układ formularza, etykiety ARIA, wysoki kontrast oraz ochrona danych logowania poprzez JWT.


### Widok Główny / Rejestracja 
- Nazwa widoku: Rejestracja 
- Ścieżka widoku: `/register`
- Główny cel: Umożliwić użytkownikowi zerejestrowanie nowego użytkownika.
- Kluczowe informacje do wyświetlenia: Formularz rejestracji (pola: username, password, email), komunikaty walidacyjne oraz ewentualne błędy rejestracji.
- Kluczowe komponenty widoku: Formularz rejestracji, komunikaty o błędach inline, Navigation Menu.
- UX, dostępność i względy bezpieczeństwa: Intuicyjny układ formularza, etykiety ARIA, wysoki kontrast.

### Dashboard
- Nazwa widoku: Dashboard
- Ścieżka widoku: `/dashboard`
- Główny cel: Prezentacja listy fiszek użytkownika wraz z możliwością filtrowania, sortowania i paginacji.
- Kluczowe informacje do wyświetlenia: Lista fiszek z podziałem na statusy (pending, accepted, rejected).
- Kluczowe komponenty widoku: Tabela lub lista fiszek, filtry, paginacja, komponenty statusowe oraz Navigation Menu.
- UX, dostępność i względy bezpieczeństwa: Czytelny i responsywny interfejs, przejrzyste komunikaty błędów (inline) oraz zabezpieczenia oparte na JWT.

### Widok Szczegółowy Fiszki
- Nazwa widoku: Szczegóły Fiszki
- Ścieżka widoku: `/flashcards/:id`
- Główny cel: Prezentacja pełnych informacji wybranej fiszki.
- Kluczowe informacje do wyświetlenia: Treść "przód" i "tył", status, data utworzenia/aktualizacji, źródło oraz ewentualne notatki.
- Kluczowe komponenty widoku: Sekcja z danymi fiszki, przyciski akcji (edytuj, zatwierdź/odrzuć, usuń), Navigation Menu.
- UX, dostępność i względy bezpieczeństwa: Przejrzysty układ, dostępne etykiety ARIA, intuicyjne przyciski oraz ochrona danych poprzez JWT.

### Widok Edycji Fiszki
- Nazwa widoku: Edycja Fiszki
- Ścieżka widoku: `/flashcards/:id/edit`
- Główny cel: Umożliwić użytkownikowi edycję pól "przód" i "tył" fiszki z uwzględnieniem walidacji długości (max 220 i 500 znaków).
- Kluczowe informacje do wyświetlenia: Formularz edycji z polami tekstowymi, komunikaty walidacyjne oraz przycisk zapisu.
- Kluczowe komponenty widoku: Formularz edycji, przycisk zapisu, komunikaty błędów inline.
- UX, dostępność i względy bezpieczeństwa: Intuicyjny formularz z natychmiastową walidacją, etykiety ARIA oraz zabezpieczenia JWT przed nieautoryzowanym dostępem.

### Widok Generacji, Zawtierdzania i Odrzucania Fiszek AI
- Nazwa widoku: Generacja Fiszek AI
- Ścieżka widoku: `/ai/generation`
- Główny cel: Umożliwić generowanie i zatwierdzanie/odrzucanie fiszek przy użyciu AI na podstawie wprowadzonego tekstu (1000-10000 znaków).
- Kluczowe informacje do wyświetlenia: Formularz wprowadzania tekstu, wyniki generacji, komunikaty walidacyjne (np. długość tekstu) oraz status procesu generacji.
- Kluczowe komponenty widoku: Pole tekstowe, przycisk generacji, lista wyników generacji z opcjami akceptuj/edytuj/odrzuć dla każdej wygenerowanej fiszki, komunikaty o błędach inline.
- UX, dostępność i względy bezpieczeństwa: Przejrzysty interfejs, wyraźne komunikaty walidacyjne, dostępność ARIA oraz autoryzacja przez JWT.

### Widok Masowego Zatwierdzania/Odrzucania Fiszek
- Nazwa widoku: Masowe Zarządzanie Fiszkami AI
- Ścieżka widoku: `/flashcards/mass-approval`
- Główny cel: Umożliwić użytkownikowi masowe zatwierdzenie lub odrzucenie fiszek wygenerowanych przez AI.
- Kluczowe informacje do wyświetlenia: Lista fiszek w trybie wyboru (checkboxy) z możliwością selekcji oraz przyciski do masowych akcji (zatwierdź, odrzuć).
- Kluczowe komponenty widoku: Tabela lub lista z opcjami wyboru, checkboxy, przyciski akcji, Navigation Menu.
- UX, dostępność i względy bezpieczeństwa: Intuicyjna selekcja wielu elementów, potwierdzenia akcji, komunikaty inline o błędach oraz zabezpieczenia JWT.

## 3. Mapa podróży użytkownika

1. Użytkownik odwiedza stronę główną (`/`) i widzi zintegrowany formularz logowania.
2. Użytkownik nie posiadający konta przechodzi do formularza rejestracji, po rejestracji wraca do strony logowania
3. Po pomyślnym logowaniu (poprzez JWT) użytkownik zostaje przekierowany do Dashboardu (`/dashboard`).
4. Na Dashboardzie użytkownik przegląda listę fiszek, korzysta z filtrów i paginacji, aby znaleźć interesujące go fiszki.
5. Klikając na konkretną fizzkę, użytkownik przechodzi do widoku Szczegółowy Fiszki (`/flashcards/:id`), gdzie przegląda pełne informacje fiszki.
6. W razie potrzeby użytkownik może wybrać opcję edycji, która przenosi go do Widoku Edycji Fiszki (`/flashcards/:id/edit`).
7. Aby wygenerować nowe fiszki, użytkownik przechodzi do Widoku Generacji Fiszek AI (`/ai/generation`), wprowadza tekst i inicjuje proces generacji. Użytkownik może akepctować/edytować lub odrzuać pojedyncze wygenerowane prze AI fiszki.
8. Po wygenerowaniu fiszek użytkownik opcjonalnie przechodzi do Widoku Masowego Zarządzania Fiszkami AI (`/flashcards/mass-approval`), gdzie dokonuje masowego zatwierdzania lub odrzucenia fiszek.
9. Nawigacja między widokami odbywa się za pomocą stałego Navigation Menu dostępnego na każdej stronie.
10. w każdym momencie użytkownik ma możliwość wylogowania za pomocą stałego przycisku w Navigation Menu

## 4. Układ i struktura nawigacji

- Główna nawigacja oparta jest na stałym pasku (Navigation Menu) umieszczonym na górze strony, który jest widoczny na wszystkich widokach.
- Menu zawiera linki do głównych widoków: Dashboard, Generacja Fiszek AI, Masowe Zarządzanie Fiszkami.
- Widok logowania jest zintegrowany w głównej stronie, a po zalogowaniu menu wyświetla dodatkowe opcje, takie jak profil użytkownika i wylogowanie.
- Nawigacja jest responsywna, z optymalizacją dla środowiska desktop oraz podstawowymi rozwiązaniami dla mniejszych ekranów.
- Dostępność zapewniona jest poprzez użycie etykiet ARIA, czytelnych kontrastów i intuicyjnych elementów nawigacyjnych.

## 5. Kluczowe komponenty

- Navigation Menu: Stały komponent zapewniający łatwą nawigację między widokami.
- Formularze: Uniwersalne formularze dla logowania, generacji fiszek, edycji oraz masowych akcji z walidacją inline.
- Lista/Tabela: Komponent do wyświetlania fiszek z opcjami filtrowania, sortowania i paginacji.
- Komunikaty o błędach: Elementy inline do wyświetlania komunikatów o błędach (np. statusy 400, 401, 500) w przystępny sposób.
- Modal/Dialogue: Okna dialogowe do potwierdzenia krytycznych akcji (np. usunięcia fiszki, zatwierdzenia masowych operacji).
- Context Provider: Globalny provider zarządzania stanem (React Context) odpowiedzialny za synchronizację danych z API i obsługę JWT. 