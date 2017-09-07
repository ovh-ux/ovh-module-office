angular.module("Module.microsoft.controllers").controller("MicrosoftOfficeLicenseUsersCtrl", class MicrosoftOfficeLicenseUsersCtrl {

    constructor (MicrosoftOfficeLicenseService, $stateParams, $scope, $timeout, Alerter) {
        this.license = MicrosoftOfficeLicenseService;
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.Alerter = Alerter;

        this.delayedGetUser = () => this.$timeout(() => {
            this.getUsersId();
        }, 250);
    }

    $onInit () {
        this.currentLicense = this.$stateParams.serviceName;

        this.usersDetails = [];
        this.loaders = {
            users: false,
            userPoll: {}
        };

        this.$scope.$on("microsoft.office.license.user.add", this.delayedGetUser);
        this.$scope.$on("microsoft.office.license.user.edit", this.delayedGetUser);
        this.$scope.$on("microsoft.office.license.user.delete", this.delayedGetUser);

        this.getUsersId();
    }

    transformItem (item) {
        return this.license.getUserDetails(this.$scope.currentLicense, item)
            .then((details) => {
                if (details.status !== "ok") {
                    this.loaders.userPoll[item] = true;

                    this.license.pollUserDetails(this.$scope.currentLicense, item, this.$scope)
                        .then(() => {
                            this.loaders.userPoll.item = false;
                            return this.delayedGetUser();
                        })
                        .catch((err) => {
                            this.loaders.userPoll.item = false;
                            return err;
                        });
                }
                return details;
            })
            .catch((err) => {
                this.loaders.userPoll.item = false;
                return err;
            });
    }

    onTransformItemDone () {
        this.loaders.users = false;
    }


    getUsersId () {
        this.loaders.users = true;
        this.users = null;

        return this.license.getUsers(this.currentLicense)
            .then((users) => { this.users = users; })
            .catch((err) => this.Alerter.error(err))
            .finally(() => {
                if (_.isEmpty(this.users)) {
                    this.loaders.users = false;
                }
            });
    }
});
