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
    return receipt;
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

