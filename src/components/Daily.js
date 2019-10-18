import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Glyphicon } from "react-bootstrap";
import moment from "moment";
import momenth from "moment-hijri";
import 'moment-timezone';
import "moment-duration-format";
import "moment/locale/bs";
// import ReactGA from "react-ga";
import Cookies from 'universal-cookie';
import slugify from "slugify";
import ReactNotifications from 'react-browser-notifications';
import uuidv4 from "uuid/v4";
import Helmet from "react-helmet";
import { locations, locationsDative, vakatNames } from '../data/vaktija.json';
import { daily } from "../api/vaktija/index.mjs";
import LogoDark from '../img/logo-dark.svg';
import IconDark from '../img/icon-dark.svg';
import LogoLight from '../img/logo-light.svg';
import IconLight from '../img/icon-light.svg';
import RelativeTime from './RelativeTime';
import VakatTime from './VakatTime';
import Counter from './Counter';
import CurrentDate from './CurrentDate';
import Location from './Location';
import Stores from './Stores';
import Locations from './Locations';
import Footer from './Footer';

const cookies = new Cookies();

// ReactGA.initialize("UA-9142566-1");

moment.updateLocale("bs", {
    iMonths: [
        "Muharrem",
        "Safer",
        "Rebi'u-l-evvel",
        "Rebi'u-l-ahir",
        "Džumade-l-ula",
        "Džumade-l-uhra",
        "Redžeb",
        "Ša'ban",
        "Ramazan",
        "Ševval",
        "Zu-l-ka'de",
        "Zu-l-hidždže"
    ],
    weekdaysShort: ["ned", "pon", "uto", "sri", "čet", "pet", "sub"]
});

class Daily extends Component {

    state = {
        currentMoment: moment().tz("Europe/Sarajevo"),
        location: this.localization(),
        date: [
            moment().tz("Europe/Sarajevo").format('ddd, D. MMMM'),
            moment().tz("Europe/Sarajevo").format('YYYY'),
            momenth().tz("Europe/Sarajevo").format("iD. iMMMM iYYYY").toLowerCase()
        ],
        vaktija: daily(this.localization()).vakat,
        next: this.next(),
        theme: moment().isBetween(moment(daily(this.localization()).vakat[1], "HH:mm"), moment(daily(this.localization()).vakat[4], "HH:mm")) ? 'light' : 'dark'
    }

    // toggleTheme = () => {

    //     const { theme } = this.state;

    //     if (theme === 'light') {
    //         document.body.classList.remove('light');
    //         document.body.classList.add('dark');
    //         this.setState({ theme: 'dark' });

    //     } else if (theme === 'dark') {
    //         document.body.classList.remove('dark');
    //         document.body.classList.add('light');
    //         this.setState({ theme: 'light' });
    //     }
    // }

    next = () => {

        const next = daily(this.localization()).vakat.map((v, i) => ({ pos: i, active: moment().tz("Europe/Sarajevo").isSameOrBefore(moment(v, 'HH:mm').tz("Europe/Sarajevo")) }))

        if (next.filter(n => n.active === true).length) {
            return next.filter(n => n.active === true)[0].pos
        } else {
            return 6
        }
    }

    showNotifications = () => {
        if (this.n.supported()) this.n.show();
    }

    handleClick = (event) => {
        window.focus();
        this.n.close(event.target.tag);
    }

    openNav = () => {
        document.getElementById("sidenav").style.width = "100%";
    }

    closeNav = (e) => {
        e.preventDefault()
        document.getElementById("sidenav").style.width = "0";
    }

    tick = () => {

        const { vaktija } = this.state;
        const clock = moment().tz("Europe/Sarajevo").format();
        const notifs = vaktija.map((v, i) => moment(v, "HH:mm").tz("Europe/Sarajevo").subtract(15, "m").format());
        const next = daily(this.localization()).vakat.map((v, i) => ({ pos: i, active: moment().tz("Europe/Sarajevo").isSameOrBefore(moment(v, 'HH:mm').tz("Europe/Sarajevo")) }))

        this.setState({
            currentMoment: moment().tz("Europe/Sarajevo"),
            date: [
                moment().tz("Europe/Sarajevo").format('ddd, D. MMMM'),
                moment().tz("Europe/Sarajevo").format('YYYY'),
                momenth().tz("Europe/Sarajevo").format("iD. iMMMM iYYYY").toLowerCase()
            ],
            vaktija: daily(this.localization()).vakat
        });

        if (notifs.includes(clock)) {
            this.setState({ position: notifs.indexOf(clock) })
            this.showNotifications();
        }


        if (next.filter(n => n.active === true).length) {
            this.setState({ next: next.filter(n => n.active === true)[0].pos })
        } else {
            this.setState({ next: 6 })
        }

        if (moment().isBetween(moment(vaktija[1], "HH:mm"), moment(vaktija[4], "HH:mm"))) {
            this.setState({ theme: 'light' })
            document.body.classList.remove('dark');
            document.body.classList.add('light');
        } else {
            this.setState({ theme: 'dark' })
            document.body.classList.remove('light');
            document.body.classList.add('dark');
        }
    };

    localization = () => {
        if (this.props.root === undefined && cookies.get("location") !== undefined) {
            return cookies.get("location");
        } else {
            return this.props.location;
        }
    }

    componentDidMount() {
        const { theme } = this.state;

        if (theme === 'light') {
            document.body.classList.remove('dark');
            document.body.classList.add('light');
        } else if (theme === 'dark') {
            document.body.classList.remove('light');
            document.body.classList.add('dark');
        }

        // ReactGA.pageview(window.location.pathname + window.location.search);
        this.timerID = setInterval(() => this.tick(), 1000);

        if (!this.props.root) {
            cookies.set("location", this.props.location, { path: '/', domain: '.vaktija.ba', expires: moment().add(1, "y").tz("Europe/Sarajevo").toDate() });
        }
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {

        const { currentMoment, date, vaktija, location, next, theme } = this.state;

        return (
            <>
                <Helmet>
                    <link
                        rel="canonical"
                        href={`https://vaktija.ba/${slugify(
                            locations[location],
                            {
                                replacement: "-",
                                remove: null,
                                lower: true,
                            },
                        )}`}
                    />
                    <meta
                        name="description"
                        content={`Vaktija za ${locationsDative[location]}, ${date[0]} ${date[1]} / ${date[2]}${
                            vakatNames.map((vakatName, index) => ` ${vakatName} ${vaktija[index]}`)
                            }. Preuzmite oficijelne Android, iOS (iPhone, iPad) i Windows mobilne aplikacije, namaz, salat, džuma, sehur, ramazan, iftar, teravija, takvim, bosna i hercegovina, sandžak`}
                    />
                    {
                        theme === 'light' &&
                        <meta name="theme-color" content="#ffffff" />
                    }

                    {
                        theme === 'dark' &&
                        <meta name="theme-color" content="#1e2227" />
                    }
                    <title>{`${locations[location]} · Vaktija`}</title>
                </Helmet>
                <ReactNotifications
                    onRef={ref => (this.n = ref)}
                    title={`${vakatNames[next]} je za 15 minuta`}
                    body={`${locationsDative[location]}, ${date[0]} ${date[1]} / ${date[2]}`}
                    icon={"icon.png"}
                    tag={uuidv4()}
                    // timeout="5000"
                    interaction="true"
                    onClick={event => this.handleClick(event)}
                />
                <Grid>
                    <Row>
                        <Col xs={6}>
                            <Link to="/">
                                {
                                    theme === 'dark' &&
                                    <>
                                        <img className="hidden-xs hidden-sm" src={LogoLight} alt="vaktija.ba" height="48"></img>
                                        <img className="hidden-md hidden-lg" src={IconLight} alt="vaktija.ba" height="32"></img>
                                    </>
                                }
                                {
                                    theme === 'light' &&
                                    <>
                                        <img className="hidden-xs hidden-sm" src={LogoDark} alt="vaktija.ba" height="48"></img>
                                        <img className="hidden-md hidden-lg" src={IconDark} alt="vaktija.ba" height="32"></img>
                                    </>
                                }
                            </Link>
                        </Col>
                        <Col className="text-right" xs={6}>
                            <Glyphicon glyph="map-marker" onClick={this.openNav} className={`glyphicon-${theme}`} />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-center" xs={12} sm={12} md={12} lg={12}>
                            <Counter vakatTime={vaktija[next]} theme={theme} />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={12} md={12} lg={12}>
                            <Location theme={theme} location={location} />
                            <CurrentDate theme={theme} date={date} location={location} />
                        </Col>
                    </Row>
                    <Row className="text-center">
                        {
                            vakatNames.map((vakatName, index) => <Col key={vaktija[index]} xs={12} sm={12} md={12} lg={2}>
                                <VakatTime theme={theme} vakatName={vakatName} vakatTime={vaktija[index]} highlight={next === index ? true : false} />
                                <RelativeTime currentMoment={currentMoment} theme={theme} vakatTime={vaktija[index]} />
                            </Col>
                            )
                        }
                    </Row>
                    <Row>
                        <Col className="text-center" xs={12} sm={12} md={12} lg={12}>
                            <br />
                            <br />
                            <Stores theme={theme} />
                        </Col>
                    </Row>
                </Grid>
                <div id="sidenav" className="sidenav">
                    <a href="true" className="closebtn" onClick={(e) => this.closeNav(e)}>&times;</a>
                    <Locations />
                </div>
                <br />
                <Footer theme={theme} />
                {/* <Grid>
                    <Row>
                        <Col lg={12} className="text-center">
                            <span className={`dot-${theme}`} onClick={this.toggleTheme}></span>
                        </Col>
                    </Row>
                </Grid> */}
            </>
        )
    }
}

Daily.defaultProps = {
    location: 77,
}
export default Daily;