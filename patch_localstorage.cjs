const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldReceiptsState = "const [receipts, setReceipts] = useState<any[]>([]);";
const newReceiptsState = `const [receipts, setReceipts] = useState<any[]>(() => {
    const saved = localStorage.getItem('receipts');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('receipts', JSON.stringify(receipts));
  }, [receipts]);`;

code = code.replace(oldReceiptsState, newReceiptsState);

const oldDynamicFoodsState = "const [dynamicFoods, setDynamicFoods] = useState<Food[]>([]);";
const newDynamicFoodsState = `const [dynamicFoods, setDynamicFoods] = useState<Food[]>(() => {
    const saved = localStorage.getItem('dynamicFoods');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('dynamicFoods', JSON.stringify(dynamicFoods));
  }, [dynamicFoods]);`;

code = code.replace(oldDynamicFoodsState, newDynamicFoodsState);

const oldProfileState = `const [userProfile, setUserProfile] = useState({
    height: 175,
    weight: 70,
    dietaryPreference: 'None'
  });`;
const newProfileState = `const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : { height: 175, weight: 70, dietaryPreference: 'None' };
  });
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);`;

code = code.replace(oldProfileState, newProfileState);

fs.writeFileSync('src/App.tsx', code);
