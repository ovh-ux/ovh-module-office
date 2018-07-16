angular.module('Module.microsoft.controllers').controller('MicrosoftOfficeLicenseConsumptionCtrl', class MicrosoftOfficeLicenseConsumptionCtrl {
  constructor(
    $stateParams, $scope,
    MicrosoftOfficeLicenseService, ChartjsFactory, OFFICE_LICENSE_CONSUMPTION,
  ) {
    this.$stateParams = $stateParams;
    this.$scope = $scope;
    this.licenseService = MicrosoftOfficeLicenseService;
    this.ChartjsFactory = ChartjsFactory;
    this.constant = { OFFICE_LICENSE_CONSUMPTION };

    this.periods = [
      { key: 'current', value: 1 },
      { key: 'last', value: 2 },
      { key: 'last3', value: 3 },
      { key: 'last12', value: 12 },
    ];

    this.selectedPeriod = this.periods[0].key;
  }

  $onInit() {
    this.currentLicense = this.$stateParams.serviceName;
    this.loaders = {
      charts: false,
    };

    this.stats = {};
    this.loaders.charts = true;

    return this.licenseService.getServiceInfos(this.currentLicense)
      .then((response) => {
        if (response.creation) {
          this.renewDate = moment(response.creation).get('date');
        } else {
          this.renewDate = 1;
        }
      })
      .catch(() => { this.renewDate = 1; })
      .finally(() => this.getStat());
  }

  getStat() {
    const interval = this.getRenewalInterval(this.selectedPeriod);
    this.loaders.charts = true;
    this.errorMessage = '';
    this.stats = {};

    return this.licenseService.consumption({
      serviceName: this.currentLicense,
      from: interval.fromDate.format(),
      to: interval.toDate.format(),
    })
      .then((series) => {
        this.stats = series;
        this.stats.title.text = this.$scope.tr(`microsoft_office_license_usage_period_${this.selectedPeriod}`);

        this.chart = new this.ChartjsFactory(
          angular.copy(this.constant.OFFICE_LICENSE_CONSUMPTION.chart),
        );
        this.chart.setAxisOptions('yAxes', {
          type: 'linear',
        });
        angular.forEach(this.stats.series, (serie) => {
          this.chart.addSerie(
            serie.name,
            _.map(serie.data, point => ({
              x: point[0],
              y: point[1],
            })),
            {
              dataset: {
                fill: true,
                borderWidth: 1,
              },
            },
          );
        });
      })
      .catch((err) => { this.errorMessage = err.message; })
      .finally(() => {
        this.loaders.charts = false;
      });
  }

  calculateRenewalDate(day, monthOffset = 0) {
    const renewal = this.constructor.calculateExpirationDate(day, monthOffset);
    return renewal.add(1, 'milliseconds');
  }

  static calculateExpirationDate(day, monthOffset = 0) {
    const month = moment().add(monthOffset, 'months');
    const expirationDate = moment(month).set('date', day).subtract(1, 'days');
    const maxExpirationDate = moment(month).endOf('month');

    return moment.min(expirationDate, maxExpirationDate).endOf('day');
  }

  getRenewalInterval(period) {
    const expirationDate = this.constructor.calculateExpirationDate(this.renewDate, 0);
    const isRenewDateComingUp = expirationDate.isAfter();
    let startingMonthOffset = this.periods
      .filter(currentPeriod => currentPeriod.key === period)[0].value;
    let endingMonthOffset = period === 'last' ? -1 : 0;

    if (!isRenewDateComingUp) {
      startingMonthOffset -= 1;
      endingMonthOffset += 1;
    }

    return {
      fromDate: this.calculateRenewalDate(this.renewDate, 0 - startingMonthOffset),
      toDate: this.constructor.calculateExpirationDate(this.renewDate, endingMonthOffset),
    };
  }
}).constant('OFFICE_LICENSE_CONSUMPTION', {
  chart: {
    type: 'line',
    data: {
      datasets: [],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'bottom',
        display: true,
      },
      elements: {
        point: {
          radius: 0,
        },
      },
      tooltips: {
        mode: 'label',
        intersect: false,
        callbacks: {
          title(data) {
            return moment(_.get(_.first(data), 'xLabel')).fromNow();
          },
        },
      },
      scales: {
        yAxes: [{
          display: true,
          position: 'left',
          scaleLabel: {
            display: true,
          },
          gridLines: {
            drawBorder: true,
            display: true,
          },
          ticks: {
            min: 0,
            stepSize: 1,
          },
        }],
        xAxes: [{
          type: 'time',
          position: 'bottom',
          gridLines: {
            drawBorder: true,
            display: false,
          },
        }],
      },
    },
  },
});
