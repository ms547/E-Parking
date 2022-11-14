var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {
    const userId = localStorage.getItem("userId");
    $scope.userData = localStorage.getItem("userData");
    $scope.userData = JSON.parse($scope.userData);
    var URL = "https://fir-1c7de-default-rtdb.firebaseio.com";
    $scope.orderDetails = {};
    $scope.seatList = [];

    $scope.viewOrderTableData = [];

    $scope.onload = function () {
        $(".routeCls").show();
        $(".paymentCls").hide();
        $(".referCls").hide();
        $("#nod").val(1);
        $("#vehicleId").val($scope.userData.driveLinceId);
    }
    $scope.placeOrder = function (data) {
        $scope.orderDetails = data;
        $scope.getOrderTableData("BOOKING");
    }
    $scope.addOrder = function () {

        if (checkIsNull($("#contactId").val())
            || checkIsNull($("#bookingDateId").val())) {
            alert("Please fill all the required data");
        } else {
            let reqstBody = {
                "parkingTypeId": $("#parkingTypeId").val(),
                "orderDate": new Date($("#bookingDateId").val()).toISOString().split('T')[0],
                "status": "pending",
                "contactId": $("#contactId").val(),
                "vehicleId": $scope.userData.driveLinceId,
                "costId": $("#costId").val(),
                "nod": $("#nod").val()

            };
            $.ajax({
                type: 'post',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/bookParkingicket/" + userId + ".json",
                data: JSON.stringify(reqstBody),
                success: function (response) {
                    $('#placeOrderModalId').modal('hide');
                    $scope.switchMenu("BILLING", "billingTabId");
                    alert("Operation has been completed sucessfully!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }
    $scope.getOrderTableData = function (type) {
        $scope.viewOrderTableData = [];
        let orderList = [];
        $.ajax({
            type: 'get',
            contentType: "application/json",
            dataType: 'json',
            cache: false,
            url: URL + "/bookParkingicket/" + userId + ".json",
            success: function (response) {
                for (let i in response) {
                    let eventData = response[i];
                    eventData["orderId"] = i;
                    orderList.push(eventData);
                }
                const seatNo = [];
                orderList.forEach(function (obj) {
                    seatNo.push(Number(obj.seatId));
                })
                $scope.viewOrderTableData = orderList.filter(function (obj) {
                    if (type == "BILLING") {
                        return obj.status === "pending";
                    } else {
                        return obj.status != "pending";
                    }
                })
                $scope.$apply();
            }, error: function (error) {
                alert("Something went wrong");
            }
        });
    }
    $scope.getOrderData = function (data) {
        $("#ammountId").val(data.costId);
        $scope.orderDetails = data;

    }
    $scope.payBill = function () {
        if ($("#paymentModeId").val() == "") {
            alert("Please select payment mode");
        } else {
            let requestBody = {
                "status": $("#paymentModeId").val()
            }
            $.ajax({
                type: 'patch',
                contentType: "application/json",
                dataType: 'json',
                cache: false,
                url: URL + "/bookParkingicket/" + userId + "/" + $scope.orderDetails.orderId + ".json",
                data: JSON.stringify(requestBody),
                success: function (response) {
                    $('#processToPayModalId').modal('hide');
                    $scope.getOrderTableData("BILLING");
                    alert("Payment sucessfully!!!");
                }, error: function (error) {
                    alert("Something went wrong");
                }
            });
        }
    }
    $scope.logout = function () {
        localStorage.removeItem("userId");
        localStorage.removeItem("userData");
        window.location.href = "loginReg.html";
    }
    $scope.switchMenu = function (type, id) {
        $(".menuCls").removeClass("active");
        $('#' + id).addClass("active");
        $("#routeDivId").hide();
        $("#biilingId").hide();
        if (type == "MENU") {
            $("#routeDivId").show();
        } else if (type == "BILLING") {
            $("#biilingId").show();
            $scope.getOrderTableData("BILLING");
        } else if (type == "HISTORY") {
            $("#biilingId").show();
            $scope.getOrderTableData("HISTORY");
        }
    }
    $scope.getParkingCost = function () {
        const data = $("#parkingTypeId").val();
        switch (data) {
            case 'Office':
                $scope.orderDetails['price'] = 1;
                break;
            case 'Home':
                $scope.orderDetails['price'] = 2;
                break;
            case 'Resident':
                $scope.orderDetails['price'] = 1;
                break;
            case 'Shopping Area':
                $scope.orderDetails['price'] = 1;
                break;
            case 'School Area':
                $scope.orderDetails['price'] = 1;
                break;
            case 'Hospital Area':
                $scope.orderDetails['price'] = 1;
                break;

        }
        const nod = $("#nod").val();
        $("#costId").val($scope.orderDetails.price * nod);
    }
    function checkIsNull(value) {
        return value === "" || value === undefined || value === null ? true : false;
    }
    function resetData() {
        $("#bookingDateId").val("");
        $("#seatId").val("");
        $("#userEmailId").val("");
        $("#passwordId").val("");
        $("#contactId").val("");

    }
    $(document).ready(function () {
        $('#placeOrderModalId').on('hidden.bs.modal', function (e) {
            resetData();
        })
    });
});
