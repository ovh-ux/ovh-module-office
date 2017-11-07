angular.module("Module.microsoft.controllers").controller("MicrosoftOfficeLicenseUserOrderCtrl", class MicrosoftOfficeLicenseUserOrderCtrl {

    constructor (Alerter, MicrosoftOfficeLicenseService, $rootScope, $scope) {
        this.alerter = Alerter;
        this.licenseService = MicrosoftOfficeLicenseService;
        this.$rootScope = $rootScope;
        this.$scope = $scope;

        this.licenseId = this.$scope.currentActionData.license;
    }

    $onInit () {
        this.loaders = {
            licenseEnum: false,
            userOrder: false
        };

        this.$scope.orderUser = () => this.orderUser();

        this.getLicenses();
    }

    orderUser () {
        this.loaders.userOrder = true;

    }

    getLicenses () {
        this.loaders.licenseEnum = true;

        this.licenseService.getLicenses()
            .then((licenseEnum) => { this.licenseEnum = licenseEnum; })
            .catch(() => { this.licenseEnum = []; })
            .finally(() => { this.loaders.licenseEnum = false; });
    }
});
