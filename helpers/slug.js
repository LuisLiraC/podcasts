import slufigy from 'slugify';

export default function slug(name){
    return slufigy(name, {lower: true}).replace(/[^\w\-]+/g, '')
}