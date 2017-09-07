angular.module("Module.microsoft.controllers").controller("MicrosoftOfficeLicenseConsumptionCtrl", class MicrosoftOfficeLicenseConsumptionCtrl {

    constructor ($stateParams, $scope, MicrosoftOfficeLicenseService) {
        this.$stateParams = $stateParams;
        this.$scope = $scope;
        this.licenseService = MicrosoftOfficeLicenseService;

        this.periods = [
            { key: "current", value: 1 },
            { key: "last", value: 2 },
            { key: "last3", value: 3 },
            { key: "last12", value: 12 }
        ];

        this.selectedPeriod = this.periods[0].key;
    }

    $onInit () {
        this.currentLicense = this.$stateParams.serviceName;
        this.loaders = {
            charts: false
        };

        this.stats = {};
        this.loaders.charts = true;

        return this.licenseService.getServiceInfos(this.currentLicense)
            .then((response) => {
                if (response.creation) {
                    this.renewDate = moment(response.creation).get("date");
                } else {
                    this.renewDate = 1;
                }
            })
            .catch(() => { this.renewDate = 1; })
            .finally(() => this.getStat());
    }

    getStat () {
        const interval = this.getRenewalInterval(this.selectedPeriod);
        this.loaders.charts = true;
        this.errorMessage = "";
        this.stats = {};

        return this.licenseService.consumption({
            serviceName: this.currentLicense,
            from: interval.fromDate.format(),
            to: interval.toDate.format()
        })
            .then((series) => {
                this.stats = series;
                this.stats.title.text = this.$scope.tr(`microsoft_office_license_usage_period_${this.selectedPeriod}`);
            })
            .catch((err) => { this.errorMessage = err.message; })
            .finally(() => {
                this.loaders.charts = false;

                if (_.last(Highcharts.charts)) {
                    this.$timeout(() => {
                        _.last(Highcharts.charts).redraw();
                    }, 300);
                }
            });
    }


    calculateRenewalDate (day, monthOffset = 0) {
        const renewal = this.calculateExpirationDate(day, monthOffset);
        return renewal.add(1, "milliseconds");
    }

    /* eslint-disable class-methods-use-this */
    calculateExpirationDate (day, monthOffset = 0) {
        const month = moment().add(monthOffset, "months");
        const expirationDate = moment(month).set("date", day).subtract(1, "days");
        const maxExpirationDate = moment(month).endOf("month");

        return moment.min(expirationDate, maxExpirationDate).endOf("day");
    }
    /* eslint-enable class-methods-use-this */

    getRenewalInterval (period) {
        const expirationDate = this.calculateExpirationDate(this.renewDate, 0);
        const isRenewDateComingUp = expirationDate.isAfter();
        let startingMonthOffset = this.periods.filter((currentPeriod) => currentPeriod.key === period)[0].value;
        let endingMonthOffset = period === "last" ? -1 : 0;

        if (!isRenewDateComingUp) {
            startingMonthOffset--;
            endingMonthOffset++;
        }

        return {
            fromDate: this.calculateRenewalDate(this.renewDate, 0 - startingMonthOffset),
            toDate: this.calculateExpirationDate(this.renewDate, endingMonthOffset)
        };
    }
});
