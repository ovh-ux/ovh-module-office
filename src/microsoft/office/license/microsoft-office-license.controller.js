angular.module("Module.microsoft.controllers").controller("MicrosoftOfficeLicenseCtrl", class MicrosoftOfficeLicenseCtrl {

    constructor ($rootScope, $stateParams, $scope, $timeout, Alerter, MicrosoftOfficeLicenseService, User) {
        this.$rootScope = $rootScope;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.alerter = Alerter;
        this.licenseService = MicrosoftOfficeLicenseService;
        this.user = User;
    }

    $onInit () {
        this.$scope.currentLicense = this.$stateParams.serviceName;
        this.newDisplayName = { value: null };
        this.license = {};
        this.$scope.domainsId = [];
        this.loaders = {
            domains: false,
            tenant: false
        };
        this.$scope.domainsDetails = [];
        this.$scope.alerts = {
            dashboard: "microsoft_office_license_alert_dashboard"
        };

        this.user.getUrlOf("guides")
            .then((guides) => {
                if (guides && guides.office365) {
                    this.guide = guides.office365;
                }
            });

        this.$scope.getDomainsId = () => {
            this.loaders.domains = true;

            return this.licenseService.getDomainsId(this.$scope.currentLicense)
                .then((domainsId) => { this.$scope.domainsId = domainsId; });
        };

        this.$scope.transformItemDomains = (domain) => {
            this.loaders.domains = true;

            return this.licenseService.getDomain(this.$scope.currentLicense, domain)
                .then((domainDetails) => domainDetails)
                .catch((err) => this.alerter.error(err))
                .finally(() => { this.loaders.domains = false; });
        };

        this.$scope.setAction = (action, data) => {
            this.$scope.currentAction = action;
            this.$scope.currentActionData = data;

            const $currentAction = $("#currentAction");

            if (action) {
                this.stepPath = `microsoft/office/license/${this.$scope.currentAction}.html`;
                $currentAction.modal({
                    keyboard: true,
                    backdrop: "static"
                });
            } else {
                $currentAction.modal("hide");
                this.$scope.currentActionData = null;
                this.$timeout(() => { this.stepPath = ""; }, 300);
            }
        };

        this.$scope.resetAction = () => this.$scope.setAction(false);

        this.getTenant();
    }

    getTenant () {
        this.loaders.tenant = true;

        return this.licenseService.get(this.$scope.currentLicense)
            .then((tenant) => {
                this.license.tenant = tenant;
                return this.license;
            })
            .finally(() => { this.loaders.tenant = false; });
    }

    editDisplayName (tenant) {
        this.newDisplayName.value = tenant.displayName;
        this.editMode = true;
    }

    resetDisplayName (event) {
        if (event.keyCode === 27) {
            this.editMode = false;
        }
    }

    saveDisplayName (license, tenant) {
        const oldDisplayName = tenant.displayName;

        tenant.displayName = this.newDisplayName.value;
        this.licenseService.edit(license, tenant)
            .then(() => {
                this.alerter.success(this.$scope.tr("microsoft_office_license_edit_success"), this.$scope.alerts.dashboard);
                this.$rootScope.$broadcast("change.displayName", [this.$scope.currentLicense, this.newDisplayName.value]);
            })
            .catch((err) => {
                this.alerter.alertFromSWS(this.$scope.tr("microsoft_office_license_edit_error"), err, this.$scope.alerts.dashboard);
                this.license.tenant.displayName = oldDisplayName;
            })
            .finally(() => { this.editMode = false; });
    }
});
