import axios from 'axios';

export default function getMap() {
  return axios.get('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
}