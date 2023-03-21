export default function(list: any[]) {
  let string = '';
        
  list.forEach((item, index) => {
    string += index === 0 ? item : `, ${item}`;
  });

  return string;
}