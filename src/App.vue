<template>
    <div id="app">
        <section class="hero is-primary">
            <div class="hero-body">
                <div class="container">
                    <h1 class="title is-1">
                        Schiphol API
                    </h1>
                </div>
            </div>
        </section>

        <div id="scrollTo" class="tabs is-centered is-marginless" style="transition: 0.3s ease-in-out"
             :class="{headerFixed: scrollPosition > 100}">
            <ul>
                <li @click="changeDir('A')" :class="{'is-active': isActive === 1, activeFixed: scrollPosition > 100}">
                    <a>
                        <span class="icon has-text-info">
                            <i class="fas fa-plane-arrival">
                            </i>
                        </span>
                    </a>
                </li>
                <li @click="changeDir('D')" :class="{'is-active': isActive === 2, activeFixed: scrollPosition > 100}">
                    <a>
                        <span class="icon has-text-info">
                            <i class="fas fa-plane-departure"></i>
                        </span>
                    </a>
                </li>
                <li @click="refresh()" :class="{'is-active': isActive === 3, activeFixed: scrollPosition > 100}">
                    <a>
                        <span class="icon has-text-info">
                            <i class="fas fa-redo-alt"></i>
                        </span>
                    </a>
                </li>
                <li @click="getBookmarked()" :class="{'is-active': isActive === 4, activeFixed: scrollPosition > 100}">
                    <a>
                        <span class="icon has-text-info">
                            <i v-if="Object.keys(bookmarks).length === 0" style="color: #7957D5;"
                               class="far fa-bookmark animated bounceIn"></i>
                            <i v-else-if="checkIcon > 0" style="color: #7957D5;"
                               class="fas fa-bookmark animated bounceIn"></i>
                            <i v-else class="fas fa-bookmark animated bounceIn"></i>
                        </span>
                    </a>
                </li>
            </ul>
        </div>

        <div class="control">
            <div v-if="connect !== false" class="animated slideInUp">
                <vs-alert v-if="showEmpty === true" class="animated slideInUp" title="Favorieten toevoegen"
                          active="true"
                          color="#842993">
                    Voeg favorieten toe door rechtsboven op een vlucht, het opslaan icoontje klik.
                </vs-alert>

                <div v-else class="animated slideInUp">
                    <label class="label" for="search">Zoek een vlucht per airline</label>
                    <input class="input" id="search" type="text" placeholder="Bijvoorbeeld, KL" v-model="search">
                </div>
            </div>
            <div v-else class="control">
                <vs-alert v-if="connect === false" class="animated slideInUp" title="Internet verbinding" active="true"
                          color="danger">
                    De verbinding met het internet is verbroken
                </vs-alert>
            </div>
        </div>

        <div>
            <transition-group name="list" mode="out-in" enter-active-class="animated slideInUp"
                              leave-active-class="animated slideOutDown" class="grid hello">
                <div :style="[checkBookmarked(bookmarks, flight['id']) ? {
                'background' : 'rgba(132,41,147,0.15)',
                'box-shadow' : '0px 0px 25px 0px rgba(132,41,147,0.15)',
                'color' : 'rgb(132,41,147)',
                'margin-top' : '10px'} : {'color' : 'red'}]" class="card grid-element con-vs-alert con-vs-alert-#842993"
                     v-for="(flight, index) in filteredResults" :key="index">
                    <div>
                        <header class="card-header"
                                :class="{'bookmarked ' : checkBookmarked(bookmarks, flight['id']) === true}">
                            <p class="card-header-title">
                                {{ flight['flightName'] }}
                            </p>
                            <p class="card-header-title" v-for="route in flight['route']" :key="route.id"
                               v-if="route.length === 1">
                            <span v-for="dest in route" :key="dest.id">
                                <span>
                                    <span v-if="flight['flightDirection'] === 'A'">
                                        <span class="icon has-text-info">
                                            <i class="fas fa-plane-arrival"></i>
                                        </span>
                                        {{ dest }} - AMS
                                    </span>
                                    <span v-else>
                                        <span class="icon has-text-info">
                                            <i class="fas fa-plane-departure"></i>
                                        </span>
                                        AMS - {{ dest }}
                                    </span>
                                </span>
                            </span>
                            </p>
                            <p class="card-header-title" v-else>
                             <span>
                                <span class="icon has-text-info">
                                    <i class="fas fa-plane-departure"></i>
                                </span>
                                AMS - {{ route[0] }} - {{ route[1] }}
                            </span>
                            </p>

                            <p class="card-header-title"
                               style="display: flex; justify-content: center; align-items: center;">
                            <span v-if="Object.keys(bookmarks).length === 0">
                                <i @click="addBookmark(flight['id'])" class="far fa-bookmark"></i>
                            </span>

                                <span v-else>
                                <i v-if="checkBookmarked(bookmarks, flight['id']) === true"
                                   @click="removeBookmark(flight['id'])" class="fas fa-bookmark animated bounceIn"></i>
                                <i v-else @click="addBookmark(flight['id'])"
                                   class="far fa-bookmark animated bounceIn"></i>
                            </span>

                            </p>

                        </header>
                        <div class="card-content" @click="openModal(flight['id'])">
                            <div class="content">
                                <p class="seperate__text">
                                    <span v-if="flight['flightDirection'] === 'A'"> Arrival: {{ flight['terminal'] }}</span>
                                    <span v-if="flight['gate']">
                                    Gate: {{ flight['gate'] }}
                                </span>
                                </p>
                                <p class="seperate__text">
                                    <span v-for="baggage in flight['baggageClaim']" :key="baggage.id">Bagage belt: {{ baggage[0] }}</span>
                                </p>
                            </div>
                            <div class="content" v-for="statuses in flight['publicFlightState']" :key="statuses.id">
                            <span v-for="statusCode in statuses" :key="statusCode.id">
                                <span v-if="statusCode[1]" class="icon has-text-info">
                                    <i class="fas fa-info-circle"></i>
                                </span>
                                <span style="color: black;" v-html="status[statusCode]"></span>
                            </span>
                                <br>
                                <p v-if="flight['estimatedLandingTime']" class="seperate__text">
                                    <span>Verwachte landingstijd: </span>
                                    <time v-html="sliceDate(flight['estimatedLandingTime'])"></time>
                                </p>
                                <span class=" tag">
                            {{ flight['prefixICAO'] }}
                        </span>
                            </div>
                        </div>
                    </div>
                </div>
            </transition-group>

        </div>
        <br>
        <div class="tabs is-centered is-marginless footer">
            <ul>
                <li>
                    <a v-if="nextPage > 1" @click="refresh(0)">
                        <span class="icon has-text-info">
                            <i class="fas fa-arrow-left is-white-text"></i>
                        </span>
                    </a>
                </li>
                <li>
                    <a @click="refresh(1)">
                        <span class="icon has-text-info">
                            <i class="fas fa-arrow-right is-white-text"></i>
                        </span>
                    </a>
                </li>
            </ul>
        </div>
        <br>
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        name: 'app',
        data() {
            return {
                isActive: 3,
                search: '',
                results: [],
                allResults: [],
                bookmarks: [],
                test: JSON.parse(localStorage.getItem('bookmarks')),
                checkIcon: Array.isArray(JSON.parse(localStorage.getItem('bookmarks'))) && JSON.parse(localStorage.getItem('bookmarks')).length,
                showEmpty: false,
                apply: true,
                activeAlert: true,
                updated: false,
                connect: null,
                scrollPosition: null,
                nextPage: 1,
                flight: 'https://api.schiphol.nl/public-flights/flights?app_id=70098e4f&app_key=9ab547d1cff062a8200bb3e8af368b7f',
                status: {
                    'SCH': 'Geeft aan wanneer een vlucht gepland is om plaats te vinden. <br>',
                    'AIR': 'Het vliegtuig is in de lucht. Het vliegtuig is onderweg. <br>',
                    'EXP': 'Verwachte landing van inkomende vlucht wijkt 10 minuten of meer af.<br>',
                    'FIR': 'Het vliegtuig is in het in Nederlandse luchtruim.<br>',
                    'LND': 'Het vliegtuig is geland en wordt naar de gate getaxied. <br>',
                    'FIB': 'De eerste koffers zullen binnenkort op de bagage belt liggen.<br>',
                    'ARR': 'Baggage is compleet afgehandeld en bevindt zich bij de bagageriem.<br>',
                    'DIV': 'Vlucht wijkt af van bestemming. Het vliegtuig zal niet op Schiphol landen.<br>',
                    'CNX': 'Vlucht zal niet vertrekken.<br>',
                    'TOM': 'Landing zal morgen plaatst vinden.<br>',
                    'DEL': 'De afwijking tussen de verwachte vertrektijd en de geplande tijd overschrijdt 10 minuten.<br>',
                    'WIL': 'Gates nog niet beschikbaar, wacht in de lounge.<br>',
                    'GTO': 'De gate is geopend. <br>',
                    'BRD': 'Het boarden van het vliegtuig is gestart.<br>',
                    'GCL': 'De gate zal binnenkort sluiten.<br>',
                    'GTD': 'De gate is gesloten, boarden is niet meer mogelijk.<br>',
                    'DEP': 'Het vliegtuig is vetrokken. <br>',
                    'GCH': 'De gate is gewijzigd. <br>',
                },
            }
        },

        methods: {
            sliceDate(dateTime) {
                let formatDateTime = '';
                let formatDate = dateTime.split('T');

                let delayFormat = formatDate[1].split('+');
                let timeFormat = formatDate[1].split('.000');
                let delay = delayFormat[1];
                formatDateTime = timeFormat[0] + ' <span> + ' + delay + '</span>';
                return formatDateTime.toLocaleString();
            },

            changeDir(direction) {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
                this.showEmpty = false;
                this.isActive = direction === 'A' ? 1 : 2;
                let resultsCheck = this.allResults;
                let extraText = '';
                let bodyText = direction === 'A' ? ' Alle aankomende vluchten ' : ' Alle uitgaande vluchten';
                if (this.connect !== true) {
                    extraText = 'Let op! U ben offline. <br>';
                    resultsCheck = JSON.parse(localStorage.getItem('allResults'));
                }
                this.dirResults = [];
                var vData = resultsCheck;
                for (let i = 0; i < vData.length; i++) {
                    if (direction === vData[i]['flightDirection']) {
                        this.dirResults.push(vData[i]);
                    }
                }
                this.$vs.notify({
                    text: extraText + bodyText,
                    color: '#7957D5',
                    position: 'bottom-center',
                    time: 1500
                });
                this.results = this.dirResults;

            },

            updateScroll() {
                this.scrollPosition = window.scrollY
            },

            refresh(sort) {
                let uri = this.flight;

                if (sort === 1) {
                    uri = this.flight + '&page=' + this.nextPage++;
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth'
                    });
                }
                else if (sort === 0) {
                    if (this.nextPage === 1) {
                        this.$vs.notify({
                            text: 'U kunt niet terug gaan',
                            color: '#7957D5',
                            position: 'bottom-center',
                            time: 1500
                        });
                    } else {
                        uri = this.flight + '&page=' + this.nextPage--
                    }
                }
                else {
                    this.nextPage = 1;
                }

                this.showEmpty = false;
                this.isActive = 3;
                this.results = [];
                this.allResults = [];
                this.dirResults = [];
                this.$vs.loading();
                axios
                    .get(uri, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'resourceversion': 'v3'
                        }
                    })
                    .then(response => {
                        setTimeout(() => {
                            this.$vs.loading.close()
                        }, 1500);
                        this.results = response.data['flights'];
                        this.allResults = response.data['flights'];

                        localStorage.setItem('results', JSON.stringify(this.results));
                        localStorage.setItem('allResults', JSON.stringify(this.allResults));

                        this.$vs.notify({
                            text: 'De vluchten zijn opgehaald',
                            color: '#7957D5',
                            position: 'bottom-center',
                            time: 1500
                        });
                        this.connect = true;
                    })
                    .catch(error => {
                        console.log(error);
                        setTimeout(() => {
                            this.$vs.loading.close()
                        }, 1000);

                        if (localStorage.getItem('results') != null) {
                            this.results = JSON.parse(localStorage.getItem('results'));
                            this.allResults = JSON.parse(localStorage.getItem('allResults'));

                            this.$vs.notify({
                                text: 'Kan niet vernieuwen',
                                color: 'warning',
                                position: 'bottom-center',
                                time: 1500
                            }, 500);
                            this.connect = false;
                        } else {
                            this.$vs.notify({
                                text: 'Er is iets misgegaan',
                                color: 'danger',
                                position: 'bottom-center',
                                time: 1500
                            }, 500);
                            this.connect = false;
                        }
                    });
            },

            openModal(id) {
                this.colorModal = '#7957D5';
                let flight = id;
                let result = this.results.filter(obj => {
                    return obj.id === flight
                });
                this.$vs.dialog({
                    color: this.colorModal,
                    title: `VLucht - ${result[0].mainFlight}`,
                    text: 'Schedule date: ' + result[0].scheduleDate +
                        ' Vlucht nummer: ' + result[0].flightNumber +
                        ' Gate: ' + result[0].gate +
                        ' Terminal: ' + result[0].terminal +
                        ' Verwachte landingstijd: ' + result[0].estimatedLandingTime +
                        ' Werkelijke landingstijd: ' + result[0].actualLandingTime +
                        ' Aircraft registration: : ' + result[0].aircraftRegistration +
                        ' Expected time boarding: : ' + result[0].expectedTimeBoarding +
                        ' Expected time gate open: : ' + result[0].expectedTimeGateOpen +
                        ' Expected time gate closing: :' + result[0].expectedTimeGateClosing,
                    accept: this.acceptAlert(result[0].mainFlight)
                })
            },

            acceptAlert(flight) {
                this.$vs.notify({
                    color: '#7957D5',
                    title: 'Je hebt ' + flight + ' bekeken',
                    text: 'Klik op de andere vluchten om meer informatie te bekijken.',
                    position: 'bottom-center',
                    time: 1500
                })
            },

            addBookmark(id) {
                let idFlight = this.results.filter(obj => {
                    return obj.id === id
                });
                this.bookmarks = this.bookmarks.concat(idFlight);
                localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));

                this.bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
            },

            removeBookmark(id) {
                let index = this.bookmarks.findIndex(x => x.id === id);
                this.bookmarks.splice(index, 1);

                let cache = JSON.parse(localStorage.getItem('bookmarks'));

                let indexCache = cache.findIndex(x => x.id === id);
                cache.splice(indexCache, 1);
                localStorage.setItem('bookmarks', JSON.stringify(cache));

                this.$vs.notify({
                    text: 'U heeft een vlucht verwijderd van uw favorieten',
                    color: 'firebrick',
                    position: 'bottom-center',
                    time: 1500
                });

                if (this.isActive === 4 && this.bookmarks.length === 0) {
                    this.showEmpty = true;
                }
            },

            checkBookmarked(bookmark, flight) {
                let check = false;
                for (let i = 0; i < bookmark.length; i++) {
                    if (bookmark[i]['id'] === flight) {
                        check = true;
                    }
                }
                if (check === true) {
                    return this.apply
                }
            },

            getBookmarked() {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
                this.isActive = 4;
                this.results = [];
                this.bookResults = [];

                if (this.bookmarks.length > 0 && this.bookmarks.length === JSON.parse(localStorage.getItem('bookmarks')).length) {
                    this.showEmpty = false;
                    let vData = this.bookmarks;
                    for (let i = 0; i < vData.length; i++) {
                        this.bookResults.push(vData[i]);
                    }
                    this.$vs.notify({
                        text: 'Uw opgeslaagde vluchten',
                        color: '#7957D5',
                        position: 'bottom-center',
                        time: 1500
                    });
                    this.results = this.bookResults;
                    this.bookmarks = this.bookResults;
                }
                else if (Array.isArray(JSON.parse(localStorage.getItem('bookmarks'))) && JSON.parse(localStorage.getItem('bookmarks')).length) {
                    this.showEmpty = false;
                    this.$vs.loading();
                    setTimeout(() => {
                        this.$vs.loading.close();
                        let vData = JSON.parse(localStorage.getItem('bookmarks'));
                        for (let i = 0; i < vData.length; i++) {
                            this.dirResults.push(vData[i]);
                        }
                        this.$vs.notify({
                            text: 'Uw opgeslaagde vluchten',
                            color: '#7957D5',
                            position: 'bottom-center',
                            time: 1500
                        });
                        this.results = this.dirResults;
                        this.bookmarks = this.dirResults;
                    }, 900);
                }

                else {
                    this.$vs.notify({
                        text: 'U heeft geen opgeslaagde vluchten',
                        color: '#7957D5',
                        position: 'bottom-center',
                        time: 1500
                    });

                    this.showEmpty = true;
                }
            }

        },

        mounted() {
            window.addEventListener('scroll', this.updateScroll);
        },

        computed: {
            filteredResults: function () {
                let self = this;
                return this.results.filter(function (res) {
                    return res.flightName.toLowerCase().indexOf(self.search.toLowerCase()) >= 0;
                });
            },

        },

        beforeMount() {
            this.refresh();
        }
    }
</script>

<style scoped>
    @import "https://cdn.jsdelivr.net/npm/animate.css@3.5.1";
    @import "https://use.fontawesome.com/releases/v5.3.1/css/all.css";
    @import url('https://fonts.googleapis.com/css?family=Montserrat:400,700');

    body {
        background: #485563; /* fallback for old browsers */
        background: -webkit-linear-gradient(to right, #374961, #485563); /* Chrome 10-25, Safari 5.1-6 */
        background: linear-gradient(to right, #374961, #485563); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        justify-items: center;
        padding-top: 50px;
    }

    #app {
        overflow: hidden;
    }

    ::-webkit-scrollbar {
        display: none;
    }

    .headerFixed {
        position: fixed;
        z-index: 1;
        background: #7957D5;
        width: 100%;
        top: 0px;
        transition: 0.3s ease-in-out;
    }

    .headerFixed i {
        color: white !important;
        transition: 0.3s ease-in-out;
    }

    .headerFixed {
        transition: 0.3s ease-in-out;
    }

    .activeFixed:hover {
        background: white;
        transition: 0.3s ease-in-out;
    }

    .activeFixed:hover i {
        color: #7957D5 !important;
        transition: 0.3s ease-in-out;
    }

    .fixed {
        position: absolute;
        top: 40vh;
        left: 0px;
        right: 0px;
        bottom: 0px;
        overflow-y: scroll;
    }

    .card {
        margin-top: 20px;
        transition: 0.3s ease-in-out;
    }

    .card-content {
        cursor: pointer;
    }

    .card-content:hover {
        transition: 0.3s ease-in-out;
        box-shadow: none;
    }

    .fas {
        color: #7957D5;
    }

    .control {
        padding-top: 15px;
        width: 95%;
        margin: 0 auto;
    }

    .control input:focus {
        outline: none;
        border: 1px solid #7957D5;
        box-shadow: 0 0 1px #7957D5;
    }

    .grid {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: space-between;
    }

    .grid-element {
        transition: 0.3s ease-in-out;
    }

    .grid-element h1, h2, h3, p {
        color: black !important;
    }

    .hello {
        margin: 0 auto;
        width: 95%;
        display: grid;
        grid-gap: 20px;
        /*4 kolommen met gelijke breedte(1fr), dus kan je dus zien net als percentage*/
        /*grid-template-columns: repeat(4, 1fr);*/
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        /*Dit zorgt ervoor dat er automatisch spacing tussen de kolommen zit, dus elke heeft tenminste 50px spacing*/
        transition: 0.3s ease-in-out;
    }

    p {
        text-align: center;
        color: gray;
    }

    .card-header {
        justify-content: center;
        align-items: center;
    }

    .seperate__text {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    i {
        float: right;
        cursor: pointer;
    }

    .footer {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 5vh;
        margin: 0;
        padding: 0;
        text-align: center;
        background: #7957D5;
        -webkit-box-shadow: 1px -1px 4px -1px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 1px -1px 4px -1px rgba(0, 0, 0, 0.75);
        box-shadow: 1px -1px 4px -1px rgba(0, 0, 0, 0.75);
    }

    .footer > * > * {
        width: 100%;
        transition: 0.3s ease-in-out;
    }

    .footer > * > *:hover {
        background: white;
        transition: 0.3s ease-in-out;
    }

    .footer > * > *:hover i {
        transition: 0.3s ease-in-out;
        color: #7957D5 !important;
    }

    .is-white-text {
        transition: 0.3s ease-in-out;
        color: white !important;
    }

</style>
