angular.module("Module.microsoft.controllers").controller("MicrosoftOfficeLicenseUserOrderCtrl", class MicrosoftOfficeLicenseUserOrderCtrl {

    constructor (Alerter, MicrosoftOfficeLicenseService, $rootScope, $scope, OvhHttp) {
        this.alerter = Alerter;
        this.licenseService = MicrosoftOfficeLicenseService;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.OvhHttp = OvhHttp;

        this.licenseId = this.$scope.currentActionData.license;
    }

    $onInit () {
        this.loaders = {
            licenseEnum: false,
            userOrder: false
        };

        this.license = null;
        this.number = 1;

        this.$scope.orderUser = () => this.orderUser();

        this.getLicenses(this.licenseId);
    }

    orderUser () {
        this.loaders.userOrder = true;
        this.licenseService.gotToOrderPrepaidLicenses(this.licenseId, this.license, this.number);
    }

    getLicenses (serviceName) {
        this.loaders.licenseEnum = true;

        return this.OvhHttp.get(`/order/cartServiceOption/office365Prepaid/${serviceName}`, {
            rootPath: "apiv6"
        }).then((licenses) => {
            this.licenseEnum = _.map(licenses, "planCode");
        }).finally(() => {
            this.loaders.licenseEnum = false;
        });
    }
});
