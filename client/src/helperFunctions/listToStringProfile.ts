export default function(list: any[]) {
  let string = '';
  if (!list) return string;
        
  list.forEach((item, index) => {
    string += index === 0 ? item : `, ${item}`;
  });

  return string;
}