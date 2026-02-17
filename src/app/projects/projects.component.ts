import { Component } from '@angular/core';

@Component({
  selector: 'rez-projects',
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
    projects = [
        {
            id: 'unrealscope',
            name: 'Unrealscope',
            url: 'https://unrealscope.com/',
            logo: 'https://unrealscope.com/unrealscope-logo.svg',
            summary: `
                Docs so good, they're unreal.
            `,
            description: `
                Unrealscope aims to be the Unreal C++ developer's swiss army knife.
                It provides API reference documentation for every version of Unreal,
                provides reference for Unreal's reflection annotations (macros), and
                also provides community features so that folks can more easily share
                their expertise.
            `
        },
        {
            id: 'sonata',
            name: 'Sonata',
            logo: '/projects/sonata-wordmark.svg',
            summary: `
                The game that will never ship
            `,
            description: `
                I'm working on a solo realtime RPG game in Unreal. It's scope is very ambitious
                which has made it an excellent way to force myself to learn everything about Unreal.
                It may never ship, but I love it and no I will not scale it back.
            `
        },
        {
            id: 'tyt',
            name: 'TYT.com',
            logo: 'https://tyt.com/assets/shield-icon-dark.svg',
            summary: `
                The largest progressive news channel
            `,
            description: `
                My day job is Lead Engineer at TYT. I did not build TYT.com alone but our team has
                always been quite small, and I've been its principal developer since it was launched
                in 2018.
            `
        },
        {
            id: 'devtools',
            name: 'Rezonant Devtools',
            url: 'https://tools.rezonant.dev',
            logo: 'https://tools.rezonant.dev/assets/logo.svg',
            summary: `
                All your dev tooling in one spot
            `,
            description: `
                There are a lot of little simple tools that a developer needs. Some of them
                are security-sensitive. Too many of them are ad-ridden hell holes which don't
                deserve your trust. Rezonant Devtools aims to be a trustworthy set of such tools.
                It has zero tracking, zero ads, zero backend servers, and sends your data exactly
                zero places. Everything is stored locally in your browser. And it's open source.
            `
        },
        {
            id: 'poker',
            name: 'Rezonant\'s Planning Poker',
            url: 'https://poker.rezonant.dev',
            logo: 'https://tools.rezonant.dev/assets/logo.svg',
            summary: `
                It's just planning poker.
            `,
            description: `
                Needed a simple planning poker that my team and I could use for our work-from-home
                planning meetings. Feel free to use it if you need something like that. Uses Firebase
                to synchronize the various "players".
            `
        },
        {
            id: 'cardsagainst',
            name: 'Cards Against The Internet',
            url: 'https://cardsagainst.rezonant.dev/',
            logo: '/projects/cardsagainst.svg',
            summary: `
                A pretty thorough Cards Against Humanity clone.
            `,
            description: `
                There wasn't a particularly good online version of
                Cards Against Humanity at the time. My friends kept wanting to play a
                pretty bad version, so I built my own so we could actually have fun.
                You can actually play it alone or even with two players (thanks to the
                "house cards" addition to the rules)
            `
        },
        {
            id: 'sliptap-party',
            name: 'Sliptap Party',
            url: 'https://party.sliptap.com',
            logo: 'https://party.sliptap.com/assets/logo.svg',
            summary: `
                Redefine the Party
            `,
            description: `
                A companion app for your parties. Request and vote on music, post comments,
                and more. Nerdy, yes, but actually pretty cool. Uses Spotify to handle the music,
                because that's the only music app with an API.
            `
        },
        {
            id: 'albs',
            name: 'Astronaut Labs\' Broadcast Stack',
            url: 'https://github.com/astronautlabs/broadcast',
            logo: 'https://astronautlabs.com/assets/logo2.svg',
            summary: `
                Thorough and easy to understand implementations of broadcast standards
            `,
            description: `
                Needed a way to monitor many HLS feeds at the same time, and saw potential
                in expanding it to support many other kinds of video feeds. Has LUFS audio
                monitoring, tracks network performance, shows SCTE splice events and more.
                Built this myself as the first product for my broadcast & media startup
                Astronaut Labs
            `
        },
        {
            id: 'overview',
            name: 'Overview',
            url: 'https://overviewqc.com/web/home',
            logo: 'https://images.astrocdn.com/overview/logo2.svg',
            summary: `
                Professional-grade broadcasting multiviewer built using web technology.
            `,
            description: `
                Needed a way to monitor many HLS feeds at the same time, and saw potential
                in expanding it to support many other kinds of video feeds. Has LUFS audio
                monitoring, tracks network performance, shows SCTE splice events and more.
                Built this myself as the first product for my broadcast & media startup
                Astronaut Labs
            `
        },
        {
            id: 'banta',
            name: 'Banta',
            url: 'https://github.com/astronautlabs/banta',
            logo: 'https://images.astrocdn.com/banta/logo.svg',
            summary: `
                Live chat and commenting
            `,
            description: `
                Needed a *good* commenting system for Angular apps, ended up making it a
                pretty nice realtime commenting system and open sourced it so anyone can
                use it. This has been used in production at TYT for several years.
                Supports real-time chat as well (though way less battle tested)
            `
        },
        {
            id: 'conjure',
            name: 'Conjure',
            url: 'https://astronautlabs.com/products/conjure',
            logo: 'https://images.astrocdn.com/conjure/logo.svg',
            summary: `
                Self-hostable online video platform
            `,
            description: `
                Needed a transcoding platform, both for video on demand and live streams.
                Accepts media uploads in a variety of formats or audio/video essence over
                RTMP and sends it to S3-compatible storage for distribution. Has a great
                UI and is very configurable and customizable.
            `
        },
        {
            id: 'obscene',
            name: 'Obscene',
            url: 'https://astronautlabs.com/products/obscene',
            logo: 'https://images.astrocdn.com/obscene/logo.svg',
            summary: `
                Your streaming automation robot
            `,
            description: `
                This is kind of like IFTT but for live streamers. It provides a low-code
                way to create complicated automations which can fire off from a number of
                triggers (like your Streamdeck, an HTTP event, or whatever else I could think
                of).
            `
        },
        {
            id: 'livefire',
            name: 'Livefire',
            url: 'https://astronautlabs.com/products/livefire',
            logo: 'https://images.astrocdn.com/livefire/logo.svg',
            summary: `
                Process live streams and VODs using graph based signal flows
            `,
            description: `
                Livefire is the control surface for Waypoint media servers and
                Splicepoint SCTE insertion servers. Provides the
                ability to create media flows using a low-code visual graph system
                or programmatically via Typescript.
            `
        },
        {
            id: 'waypoint',
            name: 'Waypoint',
            url: 'https://astronautlabs.com/products/playout',
            logo: 'https://images.astrocdn.com/playout/logo.svg',
            summary: `
                Composable media processing and routing
            `,
            description: `
                This one is quite ambitious. Aims to produce a fully programmable media server
                built on top of the open source Astronaut Labs Broadcast stack.
            `
        },
        {
            id: 'splicepoint',
            name: 'Splicepoint',
            url: 'https://astronautlabs.com/products/splicepoint',
            logo: 'https://images.astrocdn.com/splicepoint/logo.svg',
            summary: `
                Software Defined SCTE-104 Embedder
            `,
            description: `
                A programmable SCTE-104 injector for SDI and ST 2110
            `
        },
        {
            id: 'roller',
            name: 'Roller',
            url: 'https://roller.rezonant.dev',
            logo: 'https://roller.rezonant.dev/logo.svg',
            summary: `
                A TikTok clone I made while on vacation
            `,
            description: `
                One day this might become an actual thing, but for now its a simple
                TikTok clone built from scratch. The infrastructure that handles Roller's
                media processing (an instance of Conjure) is currently offline to save costs,
                so don't bother trying to upload videos, it won't work.
            `
        },
        {
            id: 'sliptap',
            name: 'Sliptap',
            url: 'https://sliptap.com',
            logo: 'https://sliptap.com/assets/img/logo.svg',
            summary: `
                All your media in one place
            `,
            description: `
                This is a longer bet. I don't think the silo'ed nature of media streaming
                apps is the final form of the technology. I predict apps like Sliptap which
                provide a unified media discovery and enjoyment interface will ultimately
                rise up and become the dominant way people consume streaming television.
                In its current iteration Sliptap is designed to crawl the web and create
                a database of the Internet's available media and lets you curate a collection
                of that media, including posting your own thoughts and customizing the look and
                feel of the media in your collection. Its probably mostly broken right now though.
            `
        }
    ]
}
