import { GenericCardData } from '../components/generic-card/generic-card.component';

export const MOCK_CHARACTERS: GenericCardData[] = [
    {
        id: 1,
        title: 'Aragorn',
        subtitle: 'Ranger of the North',
        description: 'Heir to the throne of Gondor, skilled warrior and leader of the Fellowship of the Ring.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
        badge: {
            text: 'Hero',
            type: 'success'
        },
        meta: {
            author: 'J.R.R. Tolkien',
            rating: 4.9
        },
        tags: ['Lord of the Rings', 'Human', 'Warrior', 'King'],
        universe: 'Middle-earth',
        class: 'Ranger',
        alignment: 'Good',
        weapon: 'Andúril',
        power: 'Leadership'
    },
    {
        id: 2,
        title: 'Hermione Granger',
        subtitle: 'Brightest Witch of Her Age',
        description: 'Brilliant and brave witch, best friend of Harry Potter and master of magical knowledge.',
        image: 'https://images.unsplash.com/photo-1494790108755-2616c19e9200?w=400&h=300&fit=crop',
        badge: {
            text: 'Genius',
            type: 'info'
        },
        meta: {
            author: 'J.K. Rowling',
            rating: 4.8
        },
        tags: ['Harry Potter', 'Witch', 'Gryffindor', 'Muggle-born'],
        universe: 'Wizarding World',
        class: 'Witch',
        alignment: 'Good',
        weapon: 'Magic Wand',
        power: 'Intelligence'
    },
    {
        id: 3,
        title: 'Jon Snow',
        subtitle: 'King in the North',
        description: 'Bastard son of Ned Stark who rose to become Lord Commander and later King in the North.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        badge: {
            text: 'King',
            type: 'primary'
        },
        meta: {
            author: 'George R.R. Martin',
            rating: 4.7
        },
        tags: ['Game of Thrones', 'Stark', 'Night\'s Watch', 'Targaryen'],
        universe: 'Westeros',
        class: 'Lord Commander',
        alignment: 'Good',
        weapon: 'Longclaw',
        power: 'Honor'
    },
    {
        id: 4,
        title: 'Wonder Woman',
        subtitle: 'Amazon Princess',
        description: 'Diana Prince, warrior princess from Themyscira with incredible strength and combat skills.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop',
        badge: {
            text: 'Superhero',
            type: 'success'
        },
        meta: {
            author: 'DC Comics',
            rating: 4.8
        },
        tags: ['DC Comics', 'Amazon', 'Justice League', 'Goddess'],
        universe: 'DC Universe',
        class: 'Superhero',
        alignment: 'Good',
        weapon: 'Lasso of Truth',
        power: 'Super Strength'
    },
    {
        id: 5,
        title: 'Tyrion Lannister',
        subtitle: 'The Imp',
        description: 'Clever and witty dwarf from House Lannister, known for his intelligence and political acumen.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
        badge: {
            text: 'Clever',
            type: 'warning'
        },
        meta: {
            author: 'George R.R. Martin',
            rating: 4.9
        },
        tags: ['Game of Thrones', 'Lannister', 'Dwarf', 'Hand of the King'],
        universe: 'Westeros',
        class: 'Noble',
        alignment: 'Neutral',
        weapon: 'Wit',
        power: 'Intelligence'
    },
    {
        id: 6,
        title: 'Luke Skywalker',
        subtitle: 'Jedi Knight',
        description: 'Farm boy turned Jedi who brought balance to the Force and redeemed his father.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
        badge: {
            text: 'Jedi',
            type: 'info'
        },
        meta: {
            author: 'George Lucas',
            rating: 4.8
        },
        tags: ['Star Wars', 'Jedi', 'Skywalker', 'Force'],
        universe: 'Star Wars',
        class: 'Jedi Knight',
        alignment: 'Good',
        weapon: 'Lightsaber',
        power: 'The Force'
    },
    {
        id: 7,
        title: 'Daenerys Targaryen',
        subtitle: 'Mother of Dragons',
        description: 'Last heir of House Targaryen, conqueror of cities and mother of three dragons.',
        image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=300&fit=crop',
        badge: {
            text: 'Queen',
            type: 'error'
        },
        meta: {
            author: 'George R.R. Martin',
            rating: 4.6
        },
        tags: ['Game of Thrones', 'Targaryen', 'Dragons', 'Khaleesi'],
        universe: 'Westeros',
        class: 'Queen',
        alignment: 'Neutral',
        weapon: 'Dragons',
        power: 'Dragon Blood'
    },
    {
        id: 8,
        title: 'Spider-Man',
        subtitle: 'Web-Slinger',
        description: 'Peter Parker, friendly neighborhood superhero with spider powers and great responsibility.',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
        badge: {
            text: 'Hero',
            type: 'success'
        },
        meta: {
            author: 'Marvel Comics',
            rating: 4.8
        },
        tags: ['Marvel', 'Spider Powers', 'New York', 'Friendly'],
        universe: 'Marvel Universe',
        class: 'Superhero',
        alignment: 'Good',
        weapon: 'Web Shooters',
        power: 'Spider Abilities'
    },
    {
        id: 9,
        title: 'Lara Croft',
        subtitle: 'Tomb Raider',
        description: 'Adventurous archaeologist and treasure hunter exploring ancient mysteries worldwide.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop',
        badge: {
            text: 'Explorer',
            type: 'primary'
        },
        meta: {
            author: 'Crystal Dynamics',
            rating: 4.7
        },
        tags: ['Tomb Raider', 'Archaeologist', 'Adventure', 'Explorer'],
        universe: 'Tomb Raider',
        class: 'Adventurer',
        alignment: 'Good',
        weapon: 'Dual Pistols',
        power: 'Agility'
    },
    {
        id: 10,
        title: 'Gandalf',
        subtitle: 'The Grey',
        description: 'Wise wizard and guide of the Fellowship, wielder of ancient magic and keeper of secrets.',
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop',
        badge: {
            text: 'Wizard',
            type: 'info'
        },
        meta: {
            author: 'J.R.R. Tolkien',
            rating: 5.0
        },
        tags: ['Lord of the Rings', 'Wizard', 'Istari', 'Maiar'],
        universe: 'Middle-earth',
        class: 'Wizard',
        alignment: 'Good',
        weapon: 'Glamdring',
        power: 'Ancient Magic'
    },
    {
        id: 11,
        title: 'Black Widow',
        subtitle: 'Super Spy',
        description: 'Natasha Romanoff, former Russian assassin turned Avenger with exceptional combat skills.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop',
        badge: {
            text: 'Spy',
            type: 'error'
        },
        meta: {
            author: 'Marvel Comics',
            rating: 4.7
        },
        tags: ['Marvel', 'Avengers', 'Spy', 'Assassin'],
        universe: 'Marvel Universe',
        class: 'Super Spy',
        alignment: 'Good',
        weapon: 'Widow\'s Bite',
        power: 'Combat Training'
    },
    {
        id: 12,
        title: 'Master Chief',
        subtitle: 'Spartan-117',
        description: 'Super soldier and humanity\'s greatest hope in the war against alien Covenant forces.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        badge: {
            text: 'Spartan',
            type: 'primary'
        },
        meta: {
            author: 'Bungie/343 Industries',
            rating: 4.8
        },
        tags: ['Halo', 'Spartan', 'UNSC', 'Super Soldier'],
        universe: 'Halo',
        class: 'Super Soldier',
        alignment: 'Good',
        weapon: 'MA5B Assault Rifle',
        power: 'Enhanced Abilities'
    }
];

export const CHARACTER_CATEGORIES = [
    'All',
    'Heroes',
    'Villains',
    'Wizards',
    'Warriors',
    'Spies',
    'Royalty',
    'Superheroes',
    'Explorers'
];

export const CHARACTER_UNIVERSES = [
    'All',
    'Middle-earth',
    'Wizarding World',
    'Westeros',
    'DC Universe',
    'Marvel Universe',
    'Star Wars',
    'Gaming'
];