(() => {
  let interval;
  const xmlns = 'http://www.w3.org/2000/svg';

  // индикатор загрузки (preloader)
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // загрузка базы данных
  async function clientLoaded(preloader = 'default') {
    try {
      let preloaderWrapper = null;
      let tableHeader = null;
      if (preloader === 'default') {
        tableHeader = document.querySelector('.table__header').nextElementSibling;
        preloaderWrapper = document.querySelector('.preloader');
      } else if (preloader === 'modal') {
        tableHeader = document.querySelector('.modal-form');
        preloaderWrapper = document.querySelector('.preloader-modal');
      } else if (preloader === 'modal-delete') {
        tableHeader = document.querySelector('.modal-delete__wrapper');
        preloaderWrapper = document.querySelector('.preloader-delete');
      }

      if (tableHeader !== null) {
        tableHeader.classList.add('hidden');
      }
      preloaderWrapper.classList.remove('hidden');

      // проверка индикатора загрузки
      await timeout(0);

      const response = await fetch('http://localhost:3000/api/clients');

      if (response.status < 200 || response.status >= 300) {
        const errorStatus = response.status;
        const errorText = response.statusText;
        preloaderWrapper.classList.add('hidden');
        if (tableHeader) {
          tableHeader.classList.remove('hidden');
        }
        return { errorStatus, errorText };
      }

      preloaderWrapper.classList.add('hidden');
      if (tableHeader) {
        tableHeader.classList.remove('hidden');
      }

      const data = await response.json();
      return data;
    } catch (errorText) {
      document.querySelector('.preloader').classList.add('hidden');
      errorStatus = 'catch';
      return { errorStatus, errorText };
    }
  }

  // удаление клиента
  async function deleteClient(clientId) {
    try {
      const response = await fetch(`http://localhost:3000/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
        },
      });

      if (response.status < 200 || response.status >= 300) {
        return createStatusError(response.status, response.statusText, 'delete');
      }

      // обновление списка
      let data = await clientLoaded('modal-delete');
      return data;
    } catch (errorText) {
      return createCatchError(errorText, 'delete');
    }
  }

  // сохранение нового клиента в модальном окне
  async function onSaveAdded(modalData) {
    try {
      const response = await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          name: modalData.name,
          surname: modalData.surname,
          lastName: modalData.lastName,
          contacts: modalData.contacts,
        }),
      });

      if (response.status < 200 || response.status >= 300) {
        return createStatusError(response.status, response.statusText);
      }

      // обновление списка
      let data = await clientLoaded('modal');
      return data;
    } catch (errorText) {
      return createCatchError(errorText);
    }
  }

  // сохранение изменений клиента в модальном окне
  async function onSaveChanged(modalData, modalId) {
    try {
      const response = await fetch(`http://localhost:3000/api/clients/${modalId}`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          name: modalData.name,
          surname: modalData.surname,
          lastName: modalData.lastName,
          contacts: modalData.contacts,
        }),
      });

      if (response.status < 200 || response.status >= 300) {
        return createStatusError(response.status, response.statusText);
      }

      // обновление списка
      let data = await clientLoaded('modal');
      return data;
    } catch (errorText) {
      return createCatchError(errorText);
    }
  }

  // первый вид ошибки
  function createStatusError(status, text, buttonType = 'submit') {
    const errorStatus = status;
    const errorText = text;
    const preloaderButton = document.querySelector('.modal-form__submit');
    if (preloaderButton) {
      if (buttonType === 'delete') {
        preloaderButton.innerHTML = 'Удалить';
      } else {
        preloaderButton.value = 'Сохранить';
      }
      preloaderButton.removeAttribute('disabled');
      const preloaderButtonWrapper = document.querySelector('.preloader-btn');

      if (preloaderButtonWrapper) {
        preloaderButtonWrapper.remove();
      }
    }
    return { errorStatus, errorText };
  }

  // второй вид ошибки
  function createCatchError(errorText, buttonType = 'submit') {
    const errorStatus = 'catch';
    const preloaderButton = document.querySelector('.modal-form__submit');
    if (preloaderButton) {
      if (buttonType === 'delete') {
        preloaderButton.innerHTML = 'Удалить';
      } else {
        preloaderButton.value = 'Сохранить';
      }
      preloaderButton.removeAttribute('disabled');
      const preloaderButtonWrapper = document.querySelector('.preloader-btn');

      if (preloaderButtonWrapper) {
        preloaderButtonWrapper.remove();
      }
    }
    return { errorStatus, errorText };
  }

  // рендер
  function createClientsList(clientsObjArray) {
    if (document.querySelector('.table__list')) {
      document.querySelector('.table__list').remove();
    }

    let clientsList = document.createElement('tbody');
    clientsList.classList.add('table__list');

    for (client of clientsObjArray) {
      clientsList.append(createClientsItem(client));
    }

    tippy(`#tool1676658990030Id0`, {
      popperOptions: {
        modifiers: [{ name: 'flip', enabled: false }],
      },
      content: `123123`,
      maxWidth: 165,
    });

    return clientsList;
  }

  function createClientsItem(clientsObj) {
    // DOM-дерево
    const clientsItem = document.createElement('tr');
    clientsItem.classList.add('table__item');

    const clientsItemId = document.createElement('td');
    clientsItemId.classList.add('table__cell', 'table__id', 'table__id--grey');
    clientsItemId.textContent = clientsObj.id;

    const clientsItemName = document.createElement('td');
    clientsItemName.classList.add('table__cell', 'table__descr', 'table__profile');
    clientsItemName.textContent = `${clientsObj.surname} ${clientsObj.name} ${clientsObj.lastName}`;

    const clientsItemButtonGroup = document.createElement('td');
    clientsItemButtonGroup.classList.add('table__cell', 'table__buttons', 'buttons-block');

    const clientsItemButtonChange = document.createElement('button');
    clientsItemButtonChange.classList.add('btn', 'table__button', 'table__button-change');
    clientsItemButtonChange.textContent = 'Изменить';

    const clientsItemButtonDelete = document.createElement('button');
    clientsItemButtonDelete.classList.add('btn', 'table__button', 'table__button-delete');
    clientsItemButtonDelete.textContent = 'Удалить';

    clientsItem.append(clientsItemId);

    clientsItem.append(clientsItemName);

    clientsItem.append(createClientsItemTime(clientsObj.createdAt));
    clientsItem.append(createClientsItemTime(clientsObj.updatedAt));

    clientsItem.append(createClientsItemContacts(clientsObj.contacts, clientsObj));

    clientsItemButtonGroup.append(clientsItemButtonChange, clientsItemButtonDelete);
    clientsItem.append(clientsItemButtonGroup);

    const clientsItemProfile = clientsItem.querySelector('.table__profile');

    // обработчик кнопки "профиль"
    clientsItemProfile.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'modal-profile';
      createModalWithForm(clientsObj, 'Профиль', 'changed');
    });

    // обработчик кнопки "изменить"
    clientsItemButtonChange.addEventListener('click', (e) => {
      e.preventDefault();
      createModalWithForm(clientsObj, 'Изменить данные', 'changed');
    });

    // обработчик кнопки "удалить"
    clientsItemButtonDelete.addEventListener('click', function (e) {
      e.preventDefault();
      createModalDelete(clientsObj);
    });

    return clientsItem;
  }

  function createClientsItemTime(time) {
    const clientsItemTime = document.createElement('td');
    clientsItemTime.classList.add('table__cell', 'table-time');

    const clientsItemTimeDate = document.createElement('p');
    clientsItemTimeDate.classList.add('table__descr', 'table-time__item');

    const clientsItemTimeHours = document.createElement('p');
    clientsItemTimeHours.classList.add('table__descr', 'table-time__item', 'table__descr--grey');

    const timeDate = new Date(time);

    clientsItemTimeDate.textContent = timeDate.toLocaleDateString();
    clientsItemTimeHours.textContent = `${timeDate.getHours()}:${timeDate.getMinutes()}`;

    clientsItemTime.append(clientsItemTimeDate);
    clientsItemTime.append(clientsItemTimeHours);

    return clientsItemTime;
  }

  // добавление контактов
  function createClientsItemContacts(contacts, clientsObj) {
    const clientsItemContactElem = document.createElement('td');
    clientsItemContactElem.classList.add('table__cell', 'table-contact');

    const clientsItemLinkWrapper = document.createElement('div');
    clientsItemLinkWrapper.classList.add('table-contact__list');

    let clientsItemContactArray = [];

    if (contacts && contacts.length > 0) {
      let toolId = 0;

      for (contact of contacts) {
        const clientsItemLink = document.createElement('a');
        clientsItemLink.classList.add('table-contact__link');

        const clientsItemContact = document.createElementNS(xmlns, 'svg');
        clientsItemContact.setAttribute('width', '16px');
        clientsItemContact.setAttribute('height', '16px');
        clientsItemContact.setAttribute('viewBox', '0 0 16 16');
        clientsItemContact.setAttribute('fill', 'none');

        if (contact.type === 'phone') {
          clientsItemLink.setAttribute('href', `tel:${contact.value}`);
          clientsItemContact.innerHTML = `<g opacity="0.7">
          <circle cx="8" cy="8" r="8" fill="#9873FF"/>
          <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/>
          </g>`;
          clientsItemLink.setAttribute('data-type', 'Телефон');
        } else if (contact.type === 'email') {
          clientsItemLink.setAttribute('href', `mailto:${contact.value}`);
          clientsItemContact.innerHTML = `<path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF"/>`;
          clientsItemLink.setAttribute('data-type', 'Email');
        } else if (contact.type === 'facebook') {
          clientsItemContact.innerHTML = `<g opacity="0.7">
          <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF"/>
          </g>`;
          clientsItemLink.setAttribute('data-type', 'Facebook');
        } else if (contact.type === 'other') {
          clientsItemContact.innerHTML = `<g opacity="0.7">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#9873FF"/>
          </g>`;
          clientsItemLink.setAttribute('data-type', 'Другое');
        } else if (contact.type === 'vk') {
          clientsItemContact.innerHTML = `<g opacity="0.7">
          <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF"/>
          </g>`;
          clientsItemLink.setAttribute('data-type', 'Вконтакте');
        }

        clientsItemContact.classList.add('table-contact__img');
        clientsItemLink.id = `tool${clientsObj.id}Id${toolId}`;
        clientsItemLink.setAttribute('data-value', contact.value);
        clientsItemLink.append(clientsItemContact);
        clientsItemLinkWrapper.append(clientsItemLink);
        clientsItemContactArray.push(clientsItemLink);
        ++toolId;
      }
      document.create;

      if (clientsItemContactArray.length > 5) {
        const clientsItemContactOtherSpan = document.createElement('span');
        clientsItemContactOtherSpan.classList.add('table-contact__other');
        clientsItemContactOtherSpan.innerText = `+${
          clientsItemContactArray.length - clientsItemContactArray.slice(0, 4).length
        }`;

        const clientsItemContactOther = document.createElement('button');
        clientsItemContactOther.classList.add('btn', 'table-contact__additional');
        clientsItemContactOther.append(clientsItemContactOtherSpan);

        clientsItemContactOther.addEventListener('click', () => {
          addContacts(clientsItemContactArray, clientsItemLinkWrapper);
          clientsItemContactElem.append(clientsItemLinkWrapper);
          loadTooltip();
          clientsItemContactOther.remove();
        });

        let clientsItemContactArrayNew = clientsItemContactArray.slice(0, 4);
        clientsItemContactArrayNew.push(clientsItemContactOther);

        const clientsItemLinkWrapper = document.createElement('div');
        clientsItemLinkWrapper.classList.add('table-contact__list');

        addContacts(clientsItemContactArrayNew, clientsItemLinkWrapper);
        clientsItemContactElem.append(clientsItemLinkWrapper);
      } else {
        const clientsItemLinkWrapper = document.createElement('div');
        clientsItemLinkWrapper.classList.add('table-contact__list');
        addContacts(clientsItemContactArray, clientsItemLinkWrapper);
        clientsItemContactElem.append(clientsItemLinkWrapper);
      }

      function addContacts(array, elem) {
        for (arrayItem of array) {
          elem.append(arrayItem);
        }
      }
    } else {
      clientsItemContact = '';
      clientsItemContactElem.append(clientsItemContact);
    }

    return clientsItemContactElem;
  }

  // создание модального окна
  function createModalWithForm(client, title, type) {
    let selectInc = 0;
    const modalData = {
      name: '',
      surname: '',
      lastName: '',
      contacts: [],
    };

    const modal = document.createElement('div');
    modal.classList.add('modal', 'modal-fade');

    const modalPreloader = document.querySelector('.preloader').cloneNode(true);
    modalPreloader.classList.add('preloader-modal');

    const modalTextBlock = document.createElement('div');
    modalTextBlock.classList.add('modal__text-block');

    const modalTitle = document.createElement('h3');
    modalTitle.classList.add('modal__title');
    modalTitle.textContent = title;

    // const modalCloseButton = document.createElement('img');
    // modalCloseButton.setAttribute('src', 'images/modal-delete.svg');
    const modalCloseButton = document.createElement('button');
    modalCloseButton.classList.add('btn', 'modal__btn-closed');
    const modalCloseButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    modalCloseButtonIcon.setAttribute('width', 29);
    modalCloseButtonIcon.setAttribute('height', 29);
    modalCloseButtonIcon.setAttribute('viewBox', '0 0 29 29');
    modalCloseButtonIcon.innerHTML = `<path fill-rule="evenodd" clip-rule="evenodd" d="M22.2333 7.73333L21.2666 6.76666L14.4999 13.5334L7.73324 6.7667L6.76658 7.73336L13.5332 14.5L6.7666 21.2667L7.73327 22.2333L14.4999 15.4667L21.2666 22.2334L22.2332 21.2667L15.4666 14.5L22.2333 7.73333Z" fill="#B0B0B0"/>`;
    modalCloseButton.append(modalCloseButtonIcon);
    // modalCloseButtonIcon.setAttribute('tabindex', 0);

    const modalError = document.createElement('p');
    modalError.classList.add('modal__error');

    if (type === 'changed') {
      const modalIdElem = document.createElement('p');
      modalIdElem.classList.add('modal__id');
      modalIdElem.textContent = `ID: ${client.id}`;

      modalTextBlock.append(modalTitle, modalIdElem);
    } else {
      modalTextBlock.append(modalTitle);
    }

    const modalForm = document.createElement('form');
    modalForm.classList.add('modal-form');

    const modalWrapper = document.createElement('div');
    modalWrapper.classList.add('modal-form__wrapper');

    const modalList = document.createElement('div');
    modalList.classList.add('modal-form__list');

    const modalInputName = document.createElement('input');
    modalInputName.classList.add('modal-form__input', 'modal-form__valid');

    const modalInputSurname = document.createElement('input');
    modalInputSurname.classList.add('modal-form__input', 'modal-form__valid');

    const modalInputLastName = document.createElement('input');
    modalInputLastName.classList.add('modal-form__input');

    const modalContact = document.createElement('div');
    modalContact.classList.add('modal-form__contact');

    const modalAddContact = document.createElement('button');
    modalAddContact.classList.add('btn', 'modal-form__btn');

    const modalAddContactImg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    modalAddContactImg.setAttribute('width', 16);
    modalAddContactImg.setAttribute('height', 16);
    modalAddContactImg.setAttribute('viewBox', '0 0 16 16');
    modalAddContactImg.innerHTML = `<circle cx="8.00002" cy="7.99996" r="6.015" stroke="#9873FF" stroke-width="1.3"/>
    <path d="M8.00006 5.29822V10.6982" stroke="#9873FF" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M5.29999 7.99829H10.7" stroke="#9873FF" stroke-width="1.3" stroke-linecap="round"/>`;
    modalAddContactImg.classList.add('modal-form__btn-img');
    modalAddContact.append(modalAddContactImg, 'Добавить контакт');
    modalContact.append(modalAddContact);

    // заполнение modal__item для разных типов модального окна
    const modalInputArray = [modalInputSurname, modalInputName, modalInputLastName];
    const modalTextArray = ['Фамилия', 'Имя', 'Отчество'];

    if (type === 'added') {
      modalInputArray.forEach((elem) => {
        elem.addEventListener('input', () => {
          elem.nextSibling.classList.add('hidden');
          if (!elem.value) {
            elem.nextSibling.classList.remove('hidden');
          }
        });
      });
      let i = 0;

      for (modalInput of modalInputArray) {
        const modalLabel = document.createElement('label');
        modalLabel.classList.add('modal-form__label');

        const modalLabelText = document.createElement('div');
        modalLabelText.classList.add('modal-form__text');

        const modalLabelSpan = document.createElement('span');
        modalLabelSpan.classList.add('modal-form__span');

        if (modalTextArray[i] !== 'Отчество') {
          // modalInput.setAttribute('oninput', '1');
          modalLabelSpan.textContent = '*';
        }

        modalLabelText.textContent = modalTextArray[i];
        modalLabelText.append(modalLabelSpan);
        modalLabel.append(modalInput, modalLabelText);
        modalList.append(modalLabel);
        ++i;
      }
      modalWrapper.append(modalList, modalContact);
    } else if (type === 'changed') {
      modalTextBlock.classList.add('modal__text-block--margin');

      const modalSpanName = document.createElement('span');
      modalSpanName.classList.add('modal-form__span');
      modalSpanName.setAttribute('data-value', 'Имя');

      const modalSpanSurname = document.createElement('span');
      modalSpanSurname.classList.add('modal-form__span');
      modalSpanSurname.setAttribute('data-value', 'Фамилия');

      const modalSpanLastName = document.createElement('span');
      modalSpanLastName.classList.add('modal-form__span');
      modalSpanLastName.textContent = 'Отчество';

      const modalSpanArray = [modalSpanSurname, modalSpanName, modalSpanLastName];

      let i = 0;
      let clientKeys = Object.keys(client);
      [clientKeys[0], clientKeys[1]] = [clientKeys[1], clientKeys[0]];
      for (modalInput of modalInputArray) {
        if (modalInput !== modalInputLastName) {
          const modalSpanAsterik = document.createElement('span');
          modalSpanAsterik.classList.add('modal-form__asterik');
          modalSpanAsterik.textContent = '*';
          modalSpanArray[i].append(modalSpanArray[i].dataset.value, modalSpanAsterik);
        }
        const modalContactItem = document.createElement('div');
        modalContactItem.classList.add('modal-form__item');
        modalInput.setAttribute('value', `${client[clientKeys[i]]}`);
        modalContactItem.append(modalSpanArray[i], modalInput);
        modalList.append(modalContactItem);
        ++i;
      }
      modalWrapper.append(modalList, modalContact);
    }

    const modalSubmit = document.createElement('input');
    modalSubmit.setAttribute('type', 'submit');
    modalSubmit.setAttribute('value', 'Сохранить');
    modalSubmit.classList.add('btn', 'modal-form__submit');

    const modalSubmitWrapper = document.createElement('div');
    modalSubmitWrapper.classList.add('preloader-submit');

    modalSubmitWrapper.append(modalSubmit);

    const modalCancelButton = document.createElement('button');
    modalCancelButton.classList.add('btn', 'modal-form__refuse');

    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');

    let modalStatus = false;

    // анимация модального окна
    modalOverlay.classList.remove('fadeOut');
    modalOverlay.classList.add('fadeIn');

    modal.classList.remove('fadeOut');
    modal.classList.add('fadeIn');

    modalStatus = true;

    modalForm.append(modalWrapper);
    modal.append(modalTextBlock, modalCloseButton, modalForm, modalPreloader);
    document.querySelector('.clients').append(modal, modalOverlay);

    // контакты
    if (type === 'changed' && client.contacts.length !== 0) {
      for (modalChangedContact of client.contacts) {
        addSelect(modalAddContact, selectInc, modalChangedContact.type, modalChangedContact.value);
        selectInc++;
      }
    }

    // открытие карточки клиента по hash
    if (window.location.hash === '#modal-profile') {
      document.querySelector('.modal-form__btn').classList.toggle('hidden');
      document.querySelector('.modal-form__wrapper').style.marginBottom = '0';
      modalCloseButton.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState('', document.title, window.location.pathname);
        urlObj = new URL(window.location.href);
      });
    } else {
      modalForm.append(modalSubmitWrapper, modalCancelButton);
    }

    // обработчик кнопки "добавить контакт"
    modalAddContact.addEventListener('click', function (e) {
      e.preventDefault();
      addSelect(modalAddContact, selectInc);
      selectInc++;

      // если контактов 10 и более
      let modalSelectArray = [];
      modalSelectArray = document.querySelectorAll('.select');
      if (modalSelectArray.length >= 10) {
        modalAddContact.classList.add('hidden');
      }
    });

    const modalCloseButtonArray = [modalCloseButton];
    if (type === 'added') {
      modalCloseButtonArray.push(modalCancelButton);
    }

    // закрытие модального окна
    modalCloseButtonArray.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        onClose(modal, modalOverlay);
      });
    });

    // сохранить изменения
    modalForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (validation()) {
        let i = 0;
        let clientKeys = Object.keys(modalData);
        [clientKeys[0], clientKeys[1]] = [clientKeys[1], clientKeys[0]];
        for (modalInput of modalInputArray) {
          modalData[clientKeys[i]] = modalInput.value;
          i++;
        }
        const modalSelectArray = document.querySelectorAll('.select');
        for (modalSelect of modalSelectArray) {
          const modalSelectButton = modalSelect.querySelector('.itc-select__toggle');
          const modalSelectInput = modalSelect.querySelector('.select__input');
          modalData.contacts.push({
            type: `${modalSelectButton.value}`,
            value: `${modalSelectInput.value}`,
          });
        }

        if (type === 'added') {
          (async function () {
            const saveData = await onSaveAdded(modalData);
            addModalError(saveData, modalError, modalWrapper, modal, modalOverlay);
          })();
        } else if (type === 'changed') {
          (async function () {
            const saveData = await onSaveChanged(modalData, client.id);
            addModalError(saveData, modalError, modalWrapper, modal, modalOverlay);
          })();
        }
        if (modal.classList.contains('hidden')) {
          onClose(modal, modalOverlay);
        }

        if (document.querySelector('.table__error')) {
          document.querySelector('.table__error').remove();
        }
        const preloader = document.querySelector('.preloader').cloneNode(true);
        const modalDeleteButton = document.querySelector('.modal-form__submit');
        const submitWrapper = document.querySelector('.preloader-submit');

        preloader.classList.add('preloader-btn', 'preloader-btn__submit');
        preloader.firstElementChild.classList.add('preloader-btn__icon');
        preloader.classList.remove('hidden');
        modalDeleteButton.parentElement.style.padding = '0';
        modalDeleteButton.setAttribute('disabled', 'disabled');
        modalDeleteButton.value = '';
        submitWrapper.append(preloader);
        document.querySelector('.preloader').classList.add('hidden');
      }
    });

    // удаление клиента или отмена
    if (type === 'added') {
      modalCancelButton.textContent = 'Отмена';
    } else if (type === 'changed') {
      modalCancelButton.textContent = 'Удалить клиента';
      modalCancelButton.addEventListener('click', function (e) {
        e.preventDefault();
        createModalDelete(client);
        document.querySelector('.modal').classList.add('hidden');
        document.querySelector('.modal-overlay').classList.add('hidden');
      });
    }
  }

  // ошибка при запросе на сервер в модальном окне
  function addModalError(data, error, wrapper, modal, modalOverlay) {
    if (data.errorStatus && data.errorStatus !== 200 && data.errorStatus !== 'catch') {
      error.innerText = `Ошибка ${data.errorStatus}: ${data.errorText}`;
      wrapper.after(error);
      return;
    } else if (data.errorStatus && data.errorStatus === 'catch') {
      error.innerText = `${data.errorText}`;
      wrapper.after(error);
      return;
    } else {
      document.querySelector('.table').append(createClientsList(data));
      loadTooltip();
      onClose(modal, modalOverlay);
    }
  }

  // модальное окно с подтверждением удаления клиента
  function createModalDelete(clientsObjArray) {
    const modalDeleteElem = document.createElement('div');
    modalDeleteElem.classList.add('modal', 'modal-delete');

    const modalDeleteWrapper = document.createElement('div');
    modalDeleteWrapper.classList.add('modal-delete__wrapper');

    const modalPreloader = document.querySelector('.preloader').cloneNode(true);
    modalPreloader.classList.add('preloader-delete');

    const modalDeleteTextBlock = document.createElement('div');
    modalDeleteTextBlock.classList.add('modal-delete__text-block');

    const modalDeleteTitle = document.createElement('h3');
    modalDeleteTitle.classList.add('modal__title', 'modal-delete__title');
    modalDeleteTitle.textContent = 'Удалить клиента';

    const modalDeleteDescr = document.createElement('p');
    modalDeleteDescr.classList.add('modal__descr', 'modal-delete__descr');
    modalDeleteDescr.innerHTML = `Вы&nbsp;действительно хотите удалить данного клиента?`;

    modalDeleteTextBlock.append(modalDeleteTitle, modalDeleteDescr);

    const modalDeleteButton = document.createElement('button');
    modalDeleteButton.classList.add('btn', 'modal-form__submit', 'modal-form__delete');
    modalDeleteButton.textContent = 'Удалить';

    const modalDeleteCancel = document.createElement('button');
    modalDeleteCancel.classList.add('btn', 'modal-form__refuse');
    modalDeleteCancel.textContent = 'Отмена';

    const modalDeleteOverlay = document.createElement('div');
    modalDeleteOverlay.classList.add('modal-overlay', 'modal-overlay__delete');

    const modalError = document.createElement('p');
    modalError.classList.add('table__error');

    modalDeleteWrapper.append(modalDeleteTextBlock, modalDeleteButton, modalDeleteCancel);
    modalDeleteElem.append(modalDeleteWrapper, modalPreloader);

    // "удалить"
    modalDeleteButton.addEventListener('click', async function (e) {
      e.preventDefault();
      if (document.querySelector('.table__error')) {
        document.querySelector('.table__error').remove();
      }
      const preloader = document.querySelector('.preloader').cloneNode(true);

      preloader.classList.add('preloader-btn');
      preloader.firstElementChild.classList.add('preloader-btn__icon');
      preloader.classList.remove('hidden');
      modalDeleteButton.parentElement.style.padding = '0';
      modalDeleteButton.setAttribute('disabled', 'disabled');
      modalDeleteButton.innerHTML = '';
      modalDeleteButton.append(preloader);
      document.querySelector('.preloader').classList.add('hidden');

      const deleteData = await deleteClient(clientsObjArray.id);
      addModalError(deleteData, modalError, modalDeleteTextBlock, modalDeleteElem, modalDeleteOverlay);
      const modalHidden = document.querySelector('.modal');
      const overlayHidden = modalHidden.nextSibling;
      if (modalHidden.classList.contains('hidden')) {
        onClose(modalHidden, overlayHidden);
      }
    });

    // "отмена"
    modalDeleteCancel.addEventListener('click', function (e) {
      e.preventDefault();
      const modal = document.querySelector('.modal');
      const modalOverlay = document.querySelector('.modal-overlay');
      onClose(modalDeleteElem, modalDeleteOverlay);
      if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
      }
    });

    document.querySelector('.clients').append(modalDeleteElem, modalDeleteOverlay);

    return modalDeleteElem;
  }

  // закрытие модального окна
  function onClose(modal, overlay) {
    let interval;
    modal.classList.remove('fadeIn');
    modal.classList.add('fadeOut');
    overlay.classList.remove('fadeIn');
    overlay.classList.add('fadeOut');
    clearTimeout(interval);
    interval = setTimeout(() => {
      modal.remove();
      overlay.remove();
    }, 201);
  }

  // кастомный select
  function addSelect(modal, selectInc, selected = 'phone', inputValue = '') {
    const selectElem = document.createElement('div');
    selectElem.id = `modal-select${selectInc + 1}`;

    const modalSelectElem = document.createElement('div');
    modalSelectElem.classList.add('select');

    const modalSelectInput = document.createElement('input');
    modalSelectInput.classList.add('select__input', 'modal-form__valid');

    const modalSelectCancel = document.createElement('button');
    modalSelectCancel.classList.add('btn', 'select__btn');

    const modalSelectCancelIcon = document.createElementNS(xmlns, 'svg');
    modalSelectCancelIcon.setAttribute('width', '16');
    modalSelectCancelIcon.setAttribute('height', '16');
    modalSelectCancelIcon.setAttribute('viewBox', '0 0 16 16');
    modalSelectCancelIcon.innerHTML = `<g clip-path="url(#clip0_121_1495)">
    <path d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z" fill="#B0B0B0"/>
    </g>
    <defs>
    <clipPath id="clip0_121_1495">
    <rect width="16" height="16" fill="white"/>
    </clipPath>
    </defs>`;

    modalSelectCancel.append(modalSelectCancelIcon);

    modalSelectElem.append(selectElem, modalSelectInput, modalSelectCancel);

    // "удалить контакт"
    modalSelectCancel.addEventListener('click', function (e) {
      e.preventDefault();

      modalSelectElem.remove();
      // возвращение кнопки
      const modalAddContact = document.querySelector('.modal-form__btn');
      let modalSelectArray = [];
      modalSelectArray = document.querySelectorAll('.select');
      if (modalSelectArray.length < 10 && modalAddContact.classList.contains('hidden')) {
        modalAddContact.classList.remove('hidden');
      }
    });

    modal.before(modalSelectElem);

    // параметры кастомного селекта
    const select = new ItcCustomSelect(`#modal-select${selectInc + 1}`, {
      name: 'contact',
      targetValue: `${selected}`,
      options: [
        ['phone', 'Телефон'],
        ['email', 'Email'],
        ['vk', 'Vk'],
        ['facebook', 'Facebook'],
        ['other', 'Другое'],
      ],
      onSelected(select, option) {
        createMaskOnLoad(select, select._el.nextElementSibling);
      },
    });

    const selectButton = selectElem.querySelector('.itc-select__toggle');
    createMaskOnLoad(selectButton, modalSelectInput);

    modalSelectInput.setAttribute('placeholder', 'Введите данные контакта');
    modalSelectInput.value = inputValue;
  }

  // шаблон маски для тривиальных случаев
  function createMask(telSelector, mask) {
    let im = new Inputmask(`${mask}`);
    im.mask(telSelector);
  }

  // создание маски
  function createMaskOnLoad(select, input) {
    if (select.value === 'phone') {
      createMask(input, '+7 (999)-999-99-99');
    } else if (select.value === 'email') {
      let im = new Inputmask({
        mask: '*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}[.*{2,6}][.*{1,2}]',
        greedy: false,
        onBeforePaste: function (pastedValue, opts) {
          pastedValue = pastedValue.toLowerCase();
          return pastedValue.replace('mailto:', '');
        },
        definitions: {
          '*': {
            validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~-]",
            casing: 'lower',
          },
        },
      });
      let telSelector = input;
      im.mask(telSelector);
    } else {
      let im = new Inputmask({ regex: `(.*)` });
      let telSelector = input;
      im.mask(telSelector);
    }
  }

  // валидация формы в модальном окне
  function validation() {
    let validInputs = document.querySelectorAll('.modal-form__valid');
    let emptyInputs = Array.from(validInputs).filter((input) => input.value === '');
    let error = document.createElement('div');
    error.classList.add('error');
    error.textContent = 'Заполните поле';

    validInputs.forEach(function (input) {
      if (input.value === '' || input.value.length === 0) {
        input.classList.add('error');
        if (input.classList.contains('hidden')) {
          input.classList.remove('error');
          emptyInputs.splice(emptyInputs.indexOf(input), 1);
        }
      } else {
        input.classList.remove('error');
      }
    });

    if (emptyInputs.length !== 0) {
      return false;
    }

    return true;
  }

  // сортировка клиентов
  function sortTable(table, col, reverse, type = 'default') {
    let tb = table.tBodies[0];
    let tr = Array.prototype.slice.call(tb.rows, 0),
      i;
    if (type === 'default') {
      reverse = -(+reverse || -1);
    } else {
      reverse = +reverse || -1;
    }
    tr = tr.sort(function (a, b) {
      return reverse * a.cells[col].textContent.trim().localeCompare(b.cells[col].textContent.trim());
    });
    for (i = 0; i < tr.length; ++i) tb.appendChild(tr[i]);
  }

  function makeSortable(table) {
    let th = table.tHead,
      i;
    th && (th = th.rows[0]) && (th = th.cells);
    if (th) i = th.length;
    else return;
    while (--i >= 0)
      (function (i) {
        let dir = 1;
        if (th[i].classList.contains('table__sort')) {
          th[i].addEventListener('click', function () {
            sortTable(table, i, (dir = 1 - dir), 'default');
            changedArrow(th[i]);
          });
        } else if (th[i].classList.contains('table__sort-id')) {
          th[i].addEventListener('click', function () {
            sortTable(table, i, (dir = 1 - dir), 'id');
            changedArrow(th[i]);
          });
        }
      })(i);
  }

  function changedArrow(th) {
    const rotate = document.querySelector('.table__title--rotate');
    const opacity = document.querySelector('.table__title--opacity');
    if ((rotate && rotate.parentElement !== th) || (opacity && opacity.parentElement !== th)) {
      if (rotate) rotate.classList.remove('table__title--rotate');
      if (opacity) opacity.classList.remove('table__title--opacity');
    }
    th.querySelector('.table__title').classList.toggle('table__title--rotate');
    th.querySelector('.table__title').classList.add('table__title--opacity');
  }

  function makeAllSortable(parent) {
    parent = parent || document.body;
    let t = parent.getElementsByTagName('table'),
      i = t.length;
    while (--i >= 0) makeSortable(t[i]);
  }

  window.onload = function () {
    makeAllSortable();
  };

  function loadTooltip() {
    const clientsItemArray = document.querySelectorAll('.table__item');
    for (clientsItem of clientsItemArray) {
      let toolId = 0;
      const contactLinksArray = clientsItem.querySelectorAll('.table-contact__link');
      const clientId = parseInt(clientsItem.querySelector('.table__id').textContent);
      for (contactLink of contactLinksArray) {
        tippy(`#tool${clientId}Id${toolId}`, {
          popperOptions: {
            modifiers: [{ name: 'flip', enabled: false }],
          },
          allowHTML: true,
          content: `<span class="tippy-content__thin">${contactLink.dataset.type}:</span> ${contactLink.dataset.value}`,
          maxWidth: 300,
          theme: 'main',
        });
        ++toolId;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    let clientsObjArray = await clientLoaded();
    let interval;
    const app = document.querySelector('.table');

    if (clientsObjArray.errorStatus && clientsObjArray.errorStatus !== 200 && clientsObjArray.errorStatus !== 'catch') {
      const appError = document.createElement('div');
      appError.classList.add('table__descr', 'table__error', 'table__error-main');
      appError.innerText = `Ошибка ${clientsObjArray.errorStatus}: ${clientsObjArray.errorText}`;
      app.after(appError);
    } else if (clientsObjArray.errorStatus && clientsObjArray.errorStatus === 'catch') {
      const appError = document.createElement('div');
      appError.classList.add('table__descr', 'table__error', 'table__error-main');
      appError.innerText = `${clientsObjArray.errorText}`;
      app.after(appError);
    } else {
      app.append(createClientsList(clientsObjArray));
      loadTooltip();
    }

    // фильтрация (поиск)
    const input = document.getElementById('header-search');
    input.addEventListener('input', () => {
      clearTimeout(interval);
      interval = setTimeout(async () => {
        const response = await fetch(`http://localhost:3000/api/clients?search=${input.value}`);
        const data = await response.json();
        app.append(createClientsList(data));
        console.log(data);
        loadTooltip();
      }, 500);
    });

    // кнопка "добавить клиента"
    const clientsButton = document.createElement('button');
    clientsButton.classList.add('table__btn-wrapper');

    const clientsButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    clientsButtonIcon.setAttribute('width', '23px');
    clientsButtonIcon.setAttribute('height', '16px');
    clientsButtonIcon.setAttribute('viewBox', '0 0 23 16');
    clientsButtonIcon.setAttribute('fill', 'none');
    clientsButtonIcon.innerHTML =
      '<path d="M14.5 8C16.71 8 18.5 6.21 18.5 4C18.5 1.79 16.71 0 14.5 0C12.29 0 10.5 1.79 10.5 4C10.5 6.21 12.29 8 14.5 8ZM5.5 6V3H3.5V6H0.5V8H3.5V11H5.5V8H8.5V6H5.5ZM14.5 10C11.83 10 6.5 11.34 6.5 14V16H22.5V14C22.5 11.34 17.17 10 14.5 10Z" fill="#9873FF"/>';
    clientsButtonIcon.classList.add('table__btn-icon');

    const clientsButtonText = document.createElement('p');
    clientsButtonText.classList.add('btn__descr');
    clientsButtonText.textContent = 'Добавить клиента';

    clientsButton.append(clientsButtonIcon, clientsButtonText);

    // кнопка "добавить"
    clientsButton.addEventListener('click', function (e) {
      e.preventDefault();
      createModalWithForm(clientsObjArray, 'Новый клиент', 'added');
    });

    document.querySelector('.clients__container').append(clientsButton);
  });
})();
