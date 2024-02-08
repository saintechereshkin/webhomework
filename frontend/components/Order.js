import AppModel from '../model/AppModel';

export default class Order {
    #orderID = '';   // ID (строка)
    #orderUser = ''; // ФИО (строка)
    #orderDate = ''; // Дата удаления заказа (Date)
    #medicines = []; // Список лекарств (массив объектов)
    /*
    состав medicines:
        listID
	    listMedName
	    listCount
    */


    get orderID () {return this.#orderID;}


    checkForDateDeletion = async () => {
        const dateArr = localStorage.getItem('currentDate').split('.');
        const currentDate = new Date(`${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`);
        
        if (currentDate > new Date(this.#orderDate)) {
            if (!confirm(`Датой удаляется заказ на ${this.#orderDate}`)) return;
            await AppModel.deleteOrder({order_id: this.#orderID});
            document.location.reload();
        }
    };


    sendChangesToDB = async (sendable, stockOfSendable) => {
        /*
        sendable
            order_id
            fio
            date_until
            lists
        sendable.lists
            id
            med_name
            count
        updateCountable
            name
            delta
        stock
			medName 
			medCount
			medRecipeFlag
        stockOfSendable
            name
            count
        */
        var updateCountable = []; // изменения в складе
        var remainingMedicines = this.#medicines; // оставшиеся позиции в изначальной версии заказа
        var addedSendables = []; // позиции, которых раньше в заказе не было
        var currentComparable; // текущая позиция в изначальной версии заказа
        var currentDelta; // текущее изменение количества
        var idMed;
        var updateAbort = false; // true при необходимости остановить процесс
        sendable.lists.forEach((sendMedicine, sendMedIndex) => {
            currentComparable = remainingMedicines.filter((med, id) => {
                if (med.listMedName == sendMedicine.med_name) {
                    idMed = id;
                    return true;
                }
            });
            if (currentComparable.length > 0) {
                currentComparable = currentComparable[0];
                remainingMedicines.splice(idMed, 1);
                currentDelta = currentComparable.listCount - sendMedicine.count;
                if (stockOfSendable.filter((st) => st.name == currentComparable.listMedName)[0].count < (currentDelta * (-1))) {
                    alert(`Вы дополняете заказ ещё ${currentDelta*(-1)} экземплярами лекарства ${currentComparable.listMedName}, но на складе столько нет!`);
                    updateAbort = true;
                } else {
                    sendable.lists[sendMedIndex].id = currentComparable.listID;
                    if (currentDelta !== 0) updateCountable.push({
                        name: currentComparable.listMedName,
                        delta: currentDelta
                    });
                }
            } else {
                if (stockOfSendable.filter((st) => st.name == sendMedicine.med_name)[0].count < sendMedicine.count) {
                    alert(`Вы дополняете заказ ещё ${sendMedicine.count} экземплярами лекарства ${sendMedicine.med_name}, но на складе столько нет!`);
                    updateAbort = true;
                } else {
                    updateCountable.push({
                        name: sendMedicine.med_name,
                        delta: sendMedicine.count * (-1)
                    });
                }
                addedSendables.push(sendMedicine);
            }
        });
        if (!updateAbort) {
            if (remainingMedicines.length > 0) {
                await Promise.all(remainingMedicines.map((med) => {
                    AppModel.deleteList({id: med.listID});
                    updateCountable.push({
                        name: med.listMedName,
                        delta: med.listCount
                    });
                }));
            }
            if (addedSendables.length > 0) {
                await Promise.all(addedSendables.map((med) => AppModel.addList({
                    id: med.id,
                    med_name: med.med_name,
                    count: med.count,
                    order_id: sendable.order_id
                })));
            }
            await AppModel.updateOrder(sendable);
            await AppModel.updateStock(updateCountable);
            document.location.reload();
        }
    };


    deleteThisOrder = async () => {
        if (confirm(`Вы сейчас удалите заказ от пользователя ${this.#orderUser} на ${this.#orderDate}. Вы уверены?`)) {
            if (confirm('Дата передачи заказа доставщику ещё не наступила. Товары на склад от этого удаления не вернём! Вы уверены?')) {
                await AppModel.deleteOrder({order_id: this.#orderID});
                document.location.reload();
            } else {
                return;
            }
        } else {
            return;
        }
    };


    renderList(ulParent) {
        this.#medicines.forEach(list => {
            const liElement = document.createElement('li');
            liElement.classList.add('medicine-list__item', 'medicine');
            ulParent.appendChild(liElement);

            const divMedNameElement = document.createElement('div');
            divMedNameElement.classList.add('medicine-desc-part-name');
            liElement.appendChild(divMedNameElement);

            const hMedNameElement = document.createElement('h3');
            hMedNameElement.innerText = 'Название';
            divMedNameElement.appendChild(hMedNameElement);
            const spanMedNameElement = document.createElement('span');
            spanMedNameElement.innerText = list.listMedName;
            divMedNameElement.appendChild(spanMedNameElement);

            const divMedCountElement = document.createElement('div');
            divMedCountElement.classList.add('medicine-desc-part-count');
            liElement.appendChild(divMedCountElement);

            const hMedCountElement = document.createElement('h3');
            hMedCountElement.innerText = 'Количество';
            divMedCountElement.appendChild(hMedCountElement);
            const spanMedCountElement = document.createElement('span');
            spanMedCountElement.innerText = list.listCount;
            divMedCountElement.appendChild(spanMedCountElement);
            const spanMedCountLabel = document.createElement('span');
            spanMedCountLabel.innerText = ' шт.';
            divMedCountElement.appendChild(spanMedCountLabel);
        });
    }


    renderOrder() {
        const beforeElement = document.getElementById('creation-block-li');

        const liOrderElement = document.createElement('li');
        liOrderElement.classList.add('orderlist__item', 'order');

        const divTopBlockElement = document.createElement('div');
        divTopBlockElement.classList.add('order__top-block');
        liOrderElement.appendChild(divTopBlockElement);

        const divUserInfoElement = document.createElement('div');
        divUserInfoElement.classList.add('order__user-info');
        divTopBlockElement.appendChild(divUserInfoElement);

        const hUserElement = document.createElement('h3');
        hUserElement.innerText = 'Заказчик';
        divUserInfoElement.appendChild(hUserElement);
        const spanUserElement = document.createElement('span');
        spanUserElement.innerText = this.#orderUser;
        divUserInfoElement.appendChild(spanUserElement);

        const btnDeleteOrderElement = document.createElement('button');
        btnDeleteOrderElement.type = 'button';
        btnDeleteOrderElement.classList.add('top-block__delete-order');
        btnDeleteOrderElement.innerText = '✖';
        btnDeleteOrderElement.name = `del-order_${this.#orderID}`;
        btnDeleteOrderElement.addEventListener('click', this.deleteThisOrder);
        divTopBlockElement.appendChild(btnDeleteOrderElement);

        const btnEditOrderElement = document.createElement('button');
        btnEditOrderElement.type = 'button';
        btnEditOrderElement.classList.add('top-block__edit-order');
        btnEditOrderElement.innerText = '✎';
        btnEditOrderElement.name = `edit-order_${this.#orderID}`;
        btnEditOrderElement.addEventListener('click', () => this.onEditOrder({
            orderID: this.#orderID,
            orderUser: this.#orderUser,
            orderDate: this.#orderDate,
            medicines: this.#medicines
        }));
        divTopBlockElement.appendChild(btnEditOrderElement);

        const divDateInfoElement = document.createElement('div');
        divDateInfoElement.classList.add('order__date-info');
        liOrderElement.appendChild(divDateInfoElement);

        const hDateInfoElement = document.createElement('h3');
        hDateInfoElement.innerText = 'Дата';
        divDateInfoElement.appendChild(hDateInfoElement);
        const spanDateInfoElement = document.createElement('span');
        spanDateInfoElement.innerText = this.#orderDate.toLocaleDateString();
        divDateInfoElement.appendChild(spanDateInfoElement);

        const ulListElement = document.createElement('ul');
        ulListElement.classList.add('order__medicine-list');
        liOrderElement.appendChild(ulListElement);
        
        this.renderList(ulListElement);
        beforeElement.parentElement.insertBefore(liOrderElement, beforeElement);
    }


    constructor ({
        orderID,
        orderFIO,
        orderDate,
        orderList
    }, {
        onEditOrder
    }) {
        this.#orderID = orderID;
        this.#orderUser = orderFIO;
        this.#orderDate = new Date(orderDate);
        this.#medicines = orderList;

        this.onEditOrder = onEditOrder;

        this.renderOrder();
    }
}