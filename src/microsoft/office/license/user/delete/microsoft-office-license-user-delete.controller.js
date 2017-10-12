angular.module("Module.microsoft.controllers").controller("MicrosoftOfficeLicenseUserDeleteCtrl", class MicrosoftOfficeLicenseUserDeleteCtrl {

    constructor (Alerter, MicrosoftOfficeLicenseService, $rootScope, $scope) {
        this.alerter = Alerter;
        this.license = MicrosoftOfficeLicenseService;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
    }

    $onInit () {
        this.user = angular.copy(this.$scope.currentActionData.user);

        this.loaders = {
            deleting: false
        };

        this.$scope.deleteUser = () => {
            this.loaders.deleting = true;

            this.license.deleteUser(this.$scope.currentActionData.license, this.user.activationEmail)
                .then(() => this.alerter.success(this.$scope.tr("microsoft_office_license_detail_user_delete_success"), this.$scope.alerts.main))
                .catch((err) => this.alerter.alertFromSWS(this.$scope.tr("microsoft_office_license_detail_user_delete_error"), err, this.$scope.alerts.main))
                .finally(() => {
                    this.loaders.deleting = false;
                    this.$rootScope.$broadcast("microsoft.office.license.user.delete");
                    this.$scope.resetAction();
                });
        };
    }
});
