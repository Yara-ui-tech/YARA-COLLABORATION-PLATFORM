import { supabase } from '../lib/supabase';

export interface KidsVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  age_group: string;
  category: string;
}

export interface KidsSong {
  id: string;
  title: string;
  audio_url: string;
  lyrics?: string;
  duration: string;
  category: string;
}

export interface KidsFlashcard {
  id: string;
  word: string;
  definition: string;
  image_url: string;
  fun_fact: string;
  category: string;
}

export interface KidsChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Fun' | 'Super Hero';
  reward_stars: number;
  question: string;
  options: string[];
  correct_option: number;
}

export const DEFAULT_KIDS_VIDEOS: KidsVideo[] = [
  {
    id: 'vid-1',
    title: 'Meet Sparky the Friendly Robot! 🤖',
    description: 'Learn how robots listen to code and help humans build futuristic cities!',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    age_group: '3-6 Years',
    category: 'Robotics 101'
  },
  {
    id: 'vid-2',
    title: 'Count & Code with Colorful Circuits ⚡',
    description: 'An exciting animated journey discovering how electricity lights up LEDs and powers motors.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgWg',
    thumbnail_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80',
    age_group: '4-8 Years',
    category: 'Electricity'
  },
  {
    id: 'vid-3',
    title: 'Space Rover Mars Adventure! 🚀',
    description: 'Fly to Mars with the YARA Space Rover and collect rocks using computer vision.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgWg',
    thumbnail_url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
    age_group: '5-8 Years',
    category: 'Space STEM'
  }
];

export const DEFAULT_KIDS_SONGS: KidsSong[] = [
  {
    id: 'song-1',
    title: 'The Robot Dance Song 🤖',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a85f26.mp3',
    lyrics: 'Beep boop beep! Bend your knees and move like a robot. 1, 2, 3... Code with me!',
    duration: '2:15',
    category: 'Sing-Along'
  },
  {
    id: 'song-2',
    title: 'ABC of Science & Technology 🔬',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    lyrics: 'A is for Atom, B is for Battery, C is for Code! Learn your STEM alphabet today!',
    duration: '1:45',
    category: 'Alphabet'
  },
  {
    id: 'song-3',
    title: 'Solar System Boogie! 🪐',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    lyrics: 'Spin around Mercury, dance around Venus, land on Earth with your STEM rocket!',
    duration: '2:30',
    category: 'Space Rhyme'
  }
];

export const DEFAULT_KIDS_FLASHCARDS: KidsFlashcard[] = [
  {
    id: 'card-1',
    word: 'Robot 🤖',
    definition: 'A smart machine built with sensors and motors to help people do tasks.',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    fun_fact: 'Did you know? The word robot comes from a word meaning hard worker!',
    category: 'Robotics'
  },
  {
    id: 'card-2',
    word: 'Solar Panel ☀️',
    definition: 'A shiny board that catches sunlight and turns it into clean electricity.',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    fun_fact: 'Sunlight produces enough energy in one hour to power the Earth for a full year!',
    category: 'Clean Energy'
  },
  {
    id: 'card-3',
    word: 'Microchip 💻',
    definition: 'A tiny silicon computer brain that processes instructions fast.',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    fun_fact: 'Microchips contain millions of tiny switches smaller than a hair strand!',
    category: 'Computers'
  },
  {
    id: 'card-4',
    word: 'Rocket 🚀',
    definition: 'A powerful vehicle with engines designed to travel through outer space.',
    image_url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80',
    fun_fact: 'Rockets need to travel at 28,000 kilometers per hour to get into space orbit!',
    category: 'Space'
  }
];

export const DEFAULT_KIDS_CHALLENGES: KidsChallenge[] = [
  {
    id: 'chal-1',
    title: 'What Powers a Robot? ⚡',
    description: 'Help Sparky find the right power source to start moving!',
    difficulty: 'Easy',
    reward_stars: 10,
    question: 'Which of these items gives energy to a mobile robot?',
    options: ['An Ice Cream Cone 🍦', 'A Rechargeable Battery 🔋', 'A Wooden Stick 🪵'],
    correct_option: 1
  },
  {
    id: 'chal-2',
    title: 'Space Explorer Quiz 🌌',
    description: 'Which planet is closest to the Sun in our solar system?',
    difficulty: 'Fun',
    reward_stars: 15,
    question: 'Which planet is closest to the Sun?',
    options: ['Jupiter 🪐', 'Earth 🌍', 'Mercury 🌑'],
    correct_option: 2
  }
];
