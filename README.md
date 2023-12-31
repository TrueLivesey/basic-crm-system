# Система управления контактными данными клиентов

Проект представляет собой CRM-систему для работы с данными клиентов. Написан на чистых html, css и js.

### Функционал приложения позволяет:

- Просматривать список клиентов в виде таблицы
- Добавялть нового клиента
- Изменять информацию о существующем клиенте (ФИО и контактная информация)
- Искать клиента по фамилии, имени или отчеству. Поиск работает с небольшой задержкой в 300мс
- Сортировать таблицу по ID, ФИО, дате создания и дате последних изменений
- Удалять пользователя с сервера

### Каждый контакт представляет из себя следующий набор данных:

- Имя
- Фамилия
- Отчество
- Массив объектов с контактными данными, где каждый объект содержит:
  - Тип контакта (телефон, электронная почта, ВК и т.п.)
  - Значение контакта (номер телефона, адрес электронной почты, ссылка на страницу ВК и т.п.)

### В ходе разработки были реализованы:

- Прелоадер
- Обработка ошибок
- Валидация формы
- Открытие модального окна с анимацией

### Запуск проекта:

1. Установите node.js минимум 12 версии
2. Запустите сервер. Для этого необходимо перейти в папку crm-backend и выполнить команду node index
3. Установите Live Server и запустите его
