'use strict';

function printReceipt(inputs) {
    let cartItems = getCartItemsByInputs(inputs);
    if (cartItems === null) {
        return 'ERROR';
    }
    let sumPrice = getSumPrice(cartItems);
    let discountedCartItems = getDiscountedCartItems(cartItems);
    let receipt = getReceiptFromCartItems(discountedCartItems, sumPrice);
    console.log(receipt);       //不打印则通过不了测试（无输出）
    return receipt;   //总函数，最终返回打印结果
}

const getCartItemsByInputs = (inputs) => {
    let cartItems = [];
    inputs.forEach((barcodeMessage) => {
        let barcode = getBarcodeFromBarcodeMessage(barcodeMessage);
        let amount = getAmountFromBarcodeMessage(barcodeMessage);
        let index = indexOfBarcodeInCartItems(cartItems, barcode);        //获取cartItems中属性值为barcode的item对象的索引
        if (index === -1) {                      //不存在
            let item = getItemFromItemsDB(barcode);                       //获取ItemsDB中属性值为barcode的item对象
            if (item === null) {                 //inputs 内数据有错
                return null;
            }
            item.count = amount;                 //为item对象增加key-value
            item.totalPrice = item.price * amount;
            cartItems.push(item);
        } else {                                 //已存在
            cartItems[index].count += amount;
            cartItems[index].totalPrice += cartItems[index].price * amount;
        }
    });
    return cartItems;
};

const getBarcodeFromBarcodeMessage = (barcodeMessage) => {
    let indexOfMargin = barcodeMessage.indexOf('-');
    if (indexOfMargin === -1) {
        return barcodeMessage;
    }
    let barcode = barcodeMessage.substring(0, indexOfMargin);
    return barcode;
}

const getAmountFromBarcodeMessage = (barcodeMessage) => {
    let indexofMargin = barcodeMessage.indexOf('-');
    if (indexofMargin === -1) {
        return 1;
    }
    let amount = parseFloat(barcodeMessage.substring(indexofMargin + 1));
    return amount;
}

const indexOfBarcodeInCartItems = (cartItems, barcode) => {
    for (let index = 0; index < cartItems.length; index++) {
        if (cartItems[index].barcode == barcode) {
            return index;
        }
    }
    return -1;                      //查找失败
}

const getItemFromItemsDB = (barcode) => {
    const ItemsDB = loadAllItems();
    for (let i = 0; i < ItemsDB.length; i++) {
        if (ItemsDB[i].barcode === barcode) {
            return ItemsDB[i];
        }
    }
    return null;                    //获取item对象失败
}

const getSumPrice = (cartItems) => {
    let sumPrice = 0;
    cartItems.forEach((item) => {
        sumPrice += item.totalPrice;
    });
    return sumPrice;
}

const getDiscountedCartItems = (cartItems) => {
    let discountedCartItems = cartItems.map((item) => {
        if (isBuyTwoGetOneFreeBarcode(item.barcode)) {
            item.totalPrice -= Math.floor(item.count / 3) * item.price;
        }
        return item;
    });
    return discountedCartItems;
}

const isBuyTwoGetOneFreeBarcode = (barcode) => {
    const promotions = loadPromotions();
    const buyTwoGetOneFreeBarcodes = promotions[0].barcodes;
    for (let i = 0; i < buyTwoGetOneFreeBarcodes.length; i++) {
        if (barcode === buyTwoGetOneFreeBarcodes[i]) {
            return true;
        }
    }
    return false;
}

const getReceiptFromCartItems = (discountedCartItems, sumPrice) => {
    let receipt = '***<没钱赚商店>收据***\n';
    let discountedSumPrice = 0;
    discountedCartItems.forEach((item) => {
        receipt += `名称：${item.name}，数量：${item.count}${item.unit}，单价：${item.price.toFixed(2)}(元)，小计：${item.totalPrice.toFixed(2)}(元)\n`;
        discountedSumPrice += item.totalPrice;
    });
    receipt += `----------------------
总计：${discountedSumPrice.toFixed(2)}(元)
节省：${(sumPrice - discountedSumPrice).toFixed(2)}(元)
**********************`;
    return receipt;
}