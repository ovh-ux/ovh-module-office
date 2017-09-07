angular.module("Module.microsoft.controllers").controller("MicrosoftOfficeLicenseUserAddCtrl", class MicrosoftOfficeLicenseUserAddCtrl {

    constructor (Alerter, MicrosoftOfficeLicenseService, $rootScope, $scope) {
        this.alerter = Alerter;
        this.licenseService = MicrosoftOfficeLicenseService;
        this.$rootScope = $rootScope;
        this.$scope = $scope;

        this.licenseId = this.$scope.currentActionData.license;
    }

    $onInit () {
        this.user = {
            domain: this.licenseId
        };
        this.licenseEnum = [];
        this.loaders = {
            licenseEnum: false,
            userAdd: false
        };
        this.validationLoginPattern = /^(?!\.)(?:[-!#$%&'\^_`{}~A-Za-z\d]|\.(?!\.))+(?!\.)$/;

        this.$scope.addUser = () => {
            this.loaders.userAdd = true;

            return this.licenseService.addUser(this.licenseId, this.user)
                .then((task) => {
                    this.alerter.success(this.$scope.tr("microsoft_office_license_detail_user_add_success"), this.$scope.alerts.dashboard);
                    return task;
                })
                .catch((err) => {
                    this.alerter.alertFromSWS(this.$scope.tr("microsoft_office_license_detail_user_add_error"), err, this.$scope.alerts.dashboard);
                    return err;
                })
                .finally(() => {
                    this.loaders.userAdd = false;
                    this.$rootScope.$broadcast("microsoft.office.license.user.add");
                    this.$scope.resetAction();
                });
        };

        this.getLicenses();
    }

    getLicenses () {
        this.loaders.licenseEnum = true;

        this.licenseService.getLicenses()
            .then((licenseEnum) => { this.licenseEnum = licenseEnum; })
            .catch(() => { this.licenseEnum = []; })
            .finally(() => { this.loaders.licenseEnum = false; });
    }
});
