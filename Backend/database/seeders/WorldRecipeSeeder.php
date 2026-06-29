<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Recipe;
use App\Models\Ingredient;
use App\Models\DietaryTag;

class WorldRecipeSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [];
        foreach (['Vegan','Vegetarian','Gluten-Free','Dairy-Free','High-Protein','Nut-Free','Spicy'] as $t) {
            $colors = ['Vegan'=>'#16a34a','Vegetarian'=>'#15803d','Gluten-Free'=>'#ca8a04','Dairy-Free'=>'#2563eb','High-Protein'=>'#9333ea','Nut-Free'=>'#ea580c','Spicy'=>'#dc2626'];
            $tags[$t] = DietaryTag::firstOrCreate(['name'=>$t], ['color'=>$colors[$t]]);
        }

        $recipes = [
            // ASIAN
            [
                'name'=>'Pad Thai',
                'desc'=>'Thai stir-fried rice noodles with eggs, tofu, bean sprouts and peanuts.',
                'cuisine'=>'Thai',
                'cat'=>'Lunch',
                'diff'=>'Medium',
                'time'=>20,
                'serv'=>2,
                'cost'=>1.80,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
                'tags'=>['Dairy-Free','High-Protein'],
                'ings'=>[['rice noodles','200g',0.80],['tofu','150g',0.60],['eggs','2 pcs',0.30],['bean sprouts','100g',0.40],['peanuts','30g',0.25]],
                'steps'=>[
                    'Soak rice noodles in warm water for 30 minutes until soft, then drain.',
                    'Heat oil in a wok, sauté cubed tofu until lightly browned.',
                    'Push tofu to the side, crack in eggs and scramble until cooked.',
                    'Add noodles, bean sprouts, and Pad Thai sauce. Toss everything together over high heat.',
                    'Serve hot topped with crushed peanuts and a squeeze of fresh lime.'
                ]
            ],
            [
                'name'=>'Japanese Miso Soup',
                'desc'=>'Warming Japanese soup with tofu, seaweed and green onions.',
                'cuisine'=>'Japanese',
                'cat'=>'Snacks',
                'diff'=>'Easy',
                'time'=>10,
                'serv'=>2,
                'cost'=>0.90,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
                'tags'=>['Vegan','Gluten-Free','Dairy-Free'],
                'ings'=>[['miso paste','3 tbsp',0.50],['tofu','100g',0.40],['seaweed','5g',0.20],['green onions','2 stalks',0.15]],
                'steps'=>[
                    'Bring water or dashi broth to a simmer in a saucepan.',
                    'Add dried seaweed and simmer for 2 minutes to reconstitute.',
                    'Add cubed tofu and cook gently for 1 minute.',
                    'Ladle some hot broth into a small bowl, whisk in miso paste until smooth, then pour back into the saucepan.',
                    'Remove from heat immediately (do not boil miso) and garnish with chopped green onions.'
                ]
            ],
            [
                'name'=>'Korean Bibimbap',
                'desc'=>'Colorful Korean rice bowl with vegetables, egg and gochujang sauce.',
                'cuisine'=>'Korean',
                'cat'=>'Lunch',
                'diff'=>'Medium',
                'time'=>30,
                'serv'=>2,
                'cost'=>1.60,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400',
                'tags'=>['Dairy-Free','Spicy'],
                'ings'=>[['rice','300g',0.40],['spinach','100g',0.50],['carrot','1 pc',0.20],['egg','2 pcs',0.30],['gochujang','2 tbsp',0.40]],
                'steps'=>[
                    'Cook white rice and keep warm.',
                    'Blanch spinach, squeeze dry, and season with sesame oil and salt. Julienne and sauté carrots.',
                    'Fry eggs sunny-side up in a pan.',
                    'Place a mound of warm rice in a bowl, arrange spinach and carrots in separate sections on top.',
                    'Place the fried egg in the center and serve with a dollop of gochujang chili paste.'
                ]
            ],
            [
                'name'=>'Vietnamese Pho',
                'desc'=>'Fragrant Vietnamese beef noodle soup with herbs and spices.',
                'cuisine'=>'Vietnamese',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>45,
                'serv'=>3,
                'cost'=>1.50,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
                'tags'=>['Dairy-Free','High-Protein','Gluten-Free'],
                'ings'=>[['rice noodles','250g',0.80],['beef broth','1L',1.00],['beef slices','150g',1.80],['star anise','3 pcs',0.20],['bean sprouts','100g',0.40]],
                'steps'=>[
                    'Simmer beef broth with star anise, ginger, and a splash of fish sauce for 30 minutes.',
                    'Cook rice noodles in boiling water, drain, and divide into bowls.',
                    'Lay thin raw beef slices over the noodles.',
                    'Pour the boiling hot broth directly over the beef slices (the heat cooks the beef instantly).',
                    'Serve immediately with bean sprouts, fresh basil, and lime wedges on the side.'
                ]
            ],
            [
                'name'=>'Filipino Adobo',
                'desc'=>'Classic Filipino chicken braised in vinegar, soy sauce and garlic.',
                'cuisine'=>'Filipino',
                'cat'=>'Dinner',
                'diff'=>'Easy',
                'time'=>35,
                'serv'=>4,
                'cost'=>1.20,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
                'tags'=>['Dairy-Free','High-Protein','Gluten-Free'],
                'ings'=>[['chicken thighs','600g',2.00],['soy sauce','4 tbsp',0.30],['vinegar','4 tbsp',0.20],['garlic','6 cloves',0.20],['bay leaves','3 pcs',0.10]],
                'steps'=>[
                    'In a pot, combine chicken thighs, soy sauce, vinegar, crushed garlic, and bay leaves.',
                    'Marinate for at least 10 minutes if possible.',
                    'Bring the pot to a boil, then reduce heat and simmer covered for 25 minutes until chicken is tender.',
                    'Uncover and simmer for 5-10 minutes to reduce the sauce into a glaze.',
                    'Serve chicken adobo over warm steamed white rice.'
                ]
            ],
            [
                'name'=>'Indonesian Nasi Goreng',
                'desc'=>'Indonesian fried rice with kecap manis, shrimp paste and fried egg.',
                'cuisine'=>'Indonesian',
                'cat'=>'Lunch',
                'diff'=>'Easy',
                'time'=>15,
                'serv'=>2,
                'cost'=>1.10,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
                'tags'=>['Dairy-Free','Gluten-Free'],
                'ings'=>[['cooked rice','400g',0.50],['eggs','2 pcs',0.30],['soy sauce','2 tbsp',0.20],['garlic','3 cloves',0.15],['chili','2 pcs',0.10]],
                'steps'=>[
                    'Sauté minced garlic and sliced chili in oil until fragrant.',
                    'Add cold cooked rice and stir-fry, breaking up any clumps.',
                    'Stir in soy sauce (preferably sweet soy sauce / kecap manis) until rice is evenly colored.',
                    'Push rice aside and scramble one egg inside the pan, then mix it in.',
                    'Fry the remaining egg separately to place on top of each serving.'
                ]
            ],
            [
                'name'=>'Thai Green Curry',
                'desc'=>'Creamy Thai green curry with vegetables in coconut milk.',
                'cuisine'=>'Thai',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>25,
                'serv'=>3,
                'cost'=>1.70,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
                'tags'=>['Vegan','Gluten-Free','Dairy-Free','Spicy'],
                'ings'=>[['coconut milk','400ml',1.00],['green curry paste','3 tbsp',0.60],['tofu','200g',0.80],['zucchini','1 pc',0.50],['basil','handful',0.20]],
                'steps'=>[
                    'Sauté green curry paste in a pot with a splash of coconut milk until fragrant.',
                    'Pour in the remaining coconut milk and bring to a simmer.',
                    'Add cubed tofu and sliced zucchini, simmering for 10-12 minutes until vegetables are tender.',
                    'Stir in fresh basil leaves and cook for another minute.',
                    'Serve hot with steamed jasmine rice.'
                ]
            ],
            [
                'name'=>'Malaysian Laksa',
                'desc'=>'Spicy coconut noodle soup with tofu puffs and bean sprouts.',
                'cuisine'=>'Malaysian',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>30,
                'serv'=>3,
                'cost'=>1.40,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400',
                'tags'=>['Dairy-Free','Spicy'],
                'ings'=>[['rice noodles','250g',0.80],['coconut milk','400ml',1.00],['laksa paste','4 tbsp',0.70],['tofu puffs','150g',0.60],['bean sprouts','100g',0.40]],
                'steps'=>[
                    'Fry laksa paste in a deep pot until oil separates.',
                    'Add coconut milk and water, bringing it to a simmer.',
                    'Toss in tofu puffs to absorb the flavorful broth and simmer for 10 minutes.',
                    'Cook rice noodles separately, drain, and portion into serving bowls.',
                    'Ladle hot broth and tofu puffs over noodles and garnish with raw bean sprouts.'
                ]
            ],
            // MIDDLE EASTERN
            [
                'name'=>'Lebanese Hummus Bowl',
                'desc'=>'Creamy hummus topped with olive oil, paprika and warm pita bread.',
                'cuisine'=>'Lebanese',
                'cat'=>'Snacks',
                'diff'=>'Easy',
                'time'=>10,
                'serv'=>4,
                'cost'=>0.80,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1577303935007-0d306ee638cf?w=400',
                'tags'=>['Vegan','Dairy-Free','High-Protein'],
                'ings'=>[['chickpeas','400g',0.60],['tahini','3 tbsp',0.50],['lemon','1 pc',0.20],['garlic','2 cloves',0.10],['olive oil','2 tbsp',0.30]],
                'steps'=>[
                    'Drain chickpeas, reserving a tablespoon of liquid.',
                    'Blend chickpeas, tahini, lemon juice, garlic, and a pinch of salt in a food processor until smooth.',
                    'Adjust consistency with a splash of reserved chickpea liquid or water.',
                    'Spread hummus into a serving bowl, making a well in the center.',
                    'Drizzle olive oil, dust with paprika, and serve with toasted pita bread slices.'
                ]
            ],
            [
                'name'=>'Turkish Menemen',
                'desc'=>'Spiced Turkish scrambled eggs with tomatoes and green peppers.',
                'cuisine'=>'Turkish',
                'cat'=>'Breakfast',
                'diff'=>'Easy',
                'time'=>15,
                'serv'=>2,
                'cost'=>1.00,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400',
                'tags'=>['Vegetarian','Gluten-Free'],
                'ings'=>[['eggs','4 pcs',0.60],['tomatoes','3 pcs',0.60],['green pepper','2 pcs',0.40],['olive oil','2 tbsp',0.30],['cumin','1 tsp',0.10]],
                'steps'=>[
                    'Sauté chopped green peppers in olive oil until soft.',
                    'Add peeled, chopped tomatoes and cumin, cooking until tomatoes release their juices and thicken.',
                    'Whisk eggs in a bowl and pour into the tomato-pepper mixture.',
                    'Stir gently over low heat, allowing the eggs to scramble slowly while remaining soft and creamy.',
                    'Remove from heat and serve warm, ideally with crusty bread.'
                ]
            ],
            [
                'name'=>'Israeli Shakshuka',
                'desc'=>'Poached eggs in a spiced tomato sauce with peppers and onions.',
                'cuisine'=>'Israeli',
                'cat'=>'Breakfast',
                'diff'=>'Easy',
                'time'=>20,
                'serv'=>2,
                'cost'=>1.20,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1612487528505-d2338264b821?w=400',
                'tags'=>['Vegetarian','Gluten-Free','Dairy-Free'],
                'ings'=>[['eggs','4 pcs',0.60],['canned tomatoes','400g',0.70],['onion','1 pc',0.20],['red pepper','1 pc',0.40],['paprika','1 tsp',0.10]],
                'steps'=>[
                    'Sauté diced onion and red pepper in olive oil until soft.',
                    'Add canned tomatoes, paprika, cumin, salt, and garlic, simmering for 10 minutes until thick.',
                    'Create 4 small wells in the tomato sauce using a spoon.',
                    'Crack an egg directly into each well.',
                    'Cover the skillet and cook on low for 5-8 minutes until egg whites are set but yolks are still runny.'
                ]
            ],
            [
                'name'=>'Persian Lentil Soup',
                'desc'=>'Hearty Persian soup with lentils, turmeric, lime and dried mint.',
                'cuisine'=>'Persian',
                'cat'=>'Dinner',
                'diff'=>'Easy',
                'time'=>35,
                'serv'=>4,
                'cost'=>0.90,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
                'tags'=>['Vegan','Gluten-Free','Dairy-Free','High-Protein'],
                'ings'=>[['red lentils','300g',0.90],['onion','1 pc',0.20],['turmeric','1 tsp',0.10],['lime juice','2 tbsp',0.25],['dried mint','1 tsp',0.10]],
                'steps'=>[
                    'Sauté chopped onions in a large pot until golden brown.',
                    'Add turmeric and lentils, toasting them for 1 minute.',
                    'Add water or vegetable broth, bring to a boil, then cover and simmer for 25 minutes.',
                    'Stir in fresh lime juice and season with salt and pepper.',
                    'Ladle into bowls and garnish with a sprinkle of dried mint.'
                ]
            ],
            // AFRICAN
            [
                'name'=>'Ethiopian Injera & Lentils',
                'desc'=>'Sour Ethiopian flatbread served with spiced red lentil stew (Misir Wat).',
                'cuisine'=>'Ethiopian',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>40,
                'serv'=>4,
                'cost'=>0.95,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
                'tags'=>['Vegan','Dairy-Free','High-Protein'],
                'ings'=>[['red lentils','300g',0.90],['berbere spice','2 tbsp',0.40],['onion','1 pc',0.20],['flatbread','4 pcs',0.80],['tomatoes','2 pcs',0.40]],
                'steps'=>[
                    'Cook chopped onions slowly in a dry pot until softened, then add oil and berbere spice.',
                    'Add diced tomatoes and cook until saucy.',
                    'Rinse red lentils and add to the pot along with water.',
                    'Simmer uncovered for 25-30 minutes, stirring occasionally, until lentils are tender and stew is thick.',
                    'Serve hot on top of flatbread (injera), eating with your hands.'
                ]
            ],
            [
                'name'=>'Nigerian Jollof Rice',
                'desc'=>'West African one-pot tomato rice cooked with peppers and spices.',
                'cuisine'=>'Nigerian',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>45,
                'serv'=>6,
                'cost'=>0.75,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
                'tags'=>['Vegan','Gluten-Free','Dairy-Free'],
                'ings'=>[['rice','500g',0.70],['canned tomatoes','400g',0.70],['red pepper','2 pcs',0.80],['onion','1 pc',0.20],['thyme','1 tsp',0.10]],
                'steps'=>[
                    'Blend tomatoes, red bell peppers, and onion until completely smooth.',
                    'Fry the blended tomato paste in oil with thyme and bay leaves until reduced and dark red.',
                    'Add washed rice and broth or water, stirring to combine.',
                    'Cover tightly with foil and a lid, cooking on very low heat for 30 minutes.',
                    'Allow the bottom to slightly burn (creating smoky flavor), then fluff and serve.'
                ]
            ],
            [
                'name'=>'Moroccan Vegetable Tagine',
                'desc'=>'Slow-cooked Moroccan stew with chickpeas, root vegetables and warm spices.',
                'cuisine'=>'Moroccan',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>50,
                'serv'=>4,
                'cost'=>1.30,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
                'tags'=>['Vegan','Gluten-Free','Dairy-Free'],
                'ings'=>[['chickpeas','400g',0.60],['sweet potato','2 pcs',0.80],['canned tomatoes','400g',0.70],['ras el hanout','2 tbsp',0.40],['dried apricots','50g',0.60]],
                'steps'=>[
                    'Sauté onion and ras el hanout spice in oil in a large pot.',
                    'Add cubed sweet potato, chickpeas, diced tomatoes, and water.',
                    'Cover and simmer on medium-low for 35 minutes.',
                    'Stir in chopped dried apricots and simmer for another 10 minutes until potatoes are completely tender.',
                    'Garnish with fresh cilantro and serve hot.'
                ]
            ],
            [
                'name'=>'Kenyan Githeri',
                'desc'=>'Simple Kenyan stew of boiled maize and beans with vegetables.',
                'cuisine'=>'Kenyan',
                'cat'=>'Lunch',
                'diff'=>'Easy',
                'time'=>30,
                'serv'=>4,
                'cost'=>0.60,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
                'tags'=>['Vegan','Gluten-Free','Dairy-Free','High-Protein'],
                'ings'=>[['canned kidney beans','400g',0.70],['canned maize','400g',0.60],['tomatoes','2 pcs',0.40],['onion','1 pc',0.20],['kale','100g',0.30]],
                'steps'=>[
                    'Sauté onion and garlic in oil until soft.',
                    'Add chopped tomatoes and cook until they break down into a sauce.',
                    'Add drained maize (corn) and kidney beans, stirring to combine.',
                    'Pour in a splash of water, cover, and simmer for 15 minutes.',
                    'Stir in shredded kale and cook for 3 minutes until wilted, then serve.'
                ]
            ],
            // EUROPEAN
            [
                'name'=>'Spanish Tortilla',
                'desc'=>'Classic Spanish potato omelette with onions. Serve hot or cold.',
                'cuisine'=>'Spanish',
                'cat'=>'Breakfast',
                'diff'=>'Medium',
                'time'=>30,
                'serv'=>4,
                'cost'=>0.90,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400',
                'tags'=>['Vegetarian','Gluten-Free','Dairy-Free'],
                'ings'=>[['potatoes','500g',0.60],['eggs','6 pcs',0.90],['onion','1 pc',0.20],['olive oil','4 tbsp',0.60],['salt','to taste',0.05]],
                'steps'=>[
                    'Peel and slice potatoes and onion thinly.',
                    'Sauté potatoes and onion in a large amount of olive oil over medium-low heat until completely soft but not browned. Drain oil.',
                    'Beat eggs in a large bowl, then stir in the drained potatoes and onions.',
                    'Pour the mixture back into a pan with 1 tbsp oil, cooking until the bottom is set.',
                    'Invert onto a plate, slide back into the pan, and cook the other side until cooked through.'
                ]
            ],
            [
                'name'=>'French Ratatouille',
                'desc'=>'Provençal French vegetable stew with zucchini, eggplant and tomatoes.',
                'cuisine'=>'French',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>45,
                'serv'=>4,
                'cost'=>1.10,
                'pick'=>false,
                'img'=>'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=400',
                'tags'=>['Vegan','Gluten-Free','Dairy-Free'],
                'ings'=>[['zucchini','2 pcs',0.60],['eggplant','1 pc',0.70],['tomatoes','3 pcs',0.60],['red pepper','1 pc',0.40],['garlic','4 cloves',0.20]],
                'steps'=>[
                    'Chop zucchini, eggplant, tomatoes, and red pepper into similar-sized cubes.',
                    'Sauté onion and garlic in olive oil, then add bell pepper and eggplant. Cook for 10 minutes.',
                    'Toss in zucchini and tomatoes, seasoning with thyme and rosemary.',
                    'Cover and simmer on low for 30 minutes until vegetables are tender and saucy.',
                    'Serve hot or cold, drizzled with extra olive oil.'
                ]
            ],
            [
                'name'=>'Greek Spanakopita',
                'desc'=>'Flaky Greek spinach and feta pie in crispy phyllo pastry.',
                'cuisine'=>'Greek',
                'cat'=>'Snacks',
                'diff'=>'Medium',
                'time'=>50,
                'serv'=>6,
                'cost'=>1.20,
                'pick'=>false,
                'img'=>'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?w=400',
                'tags'=>['Vegetarian','High-Protein'],
                'ings'=>[['phyllo pastry','250g',1.20],['spinach','300g',0.80],['feta cheese','200g',1.50],['eggs','2 pcs',0.30],['onion','1 pc',0.20]],
                'steps'=>[
                    'Sauté onion and spinach in a pan until wilted, then squeeze out all excess moisture thoroughly.',
                    'In a bowl, crumble feta and mix with the cooked spinach, beaten eggs, and pepper.',
                    'Layer phyllo sheets in a baking dish, brushing each layer with melted butter.',
                    'Pour the spinach-feta mixture over the phyllo sheets.',
                    'Top with remaining phyllo layers, score into squares, and bake at 375°F (190°C) for 40 minutes until golden and flaky.'
                ]
            ],
            [
                'name'=>'Polish Pierogi',
                'desc'=>'Polish dumplings stuffed with potato and cheese, pan-fried in butter.',
                'cuisine'=>'Polish',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>45,
                'serv'=>4,
                'cost'=>1.00,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400',
                'tags'=>['Vegetarian','High-Protein'],
                'ings'=>[['flour','300g',0.30],['potatoes','400g',0.50],['cheddar cheese','100g',0.80],['onion','1 pc',0.20],['butter','50g',0.40]],
                'steps'=>[
                    'Boil potatoes and mash them with cheese and sautéed onions to make the filling.',
                    'Mix flour, water, and a pinch of salt to form a soft dough. Roll out and cut into circles.',
                    'Place a spoonful of potato filling in the center of each dough circle, fold over, and pinch edges to seal.',
                    'Boil pierogis in batches until they float to the top.',
                    'Drain and pan-fry in butter until lightly crispy and golden brown.'
                ]
            ],
            [
                'name'=>'Italian Cacio e Pepe',
                'desc'=>'Roman pasta with just Pecorino cheese, black pepper and pasta water.',
                'cuisine'=>'Italian',
                'cat'=>'Dinner',
                'diff'=>'Easy',
                'time'=>15,
                'serv'=>2,
                'cost'=>1.30,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
                'tags'=>['Vegetarian','High-Protein'],
                'ings'=>[['spaghetti','200g',0.60],['Pecorino Romano','80g',1.20],['black pepper','2 tsp',0.20],['pasta water','200ml',0.00]],
                'steps'=>[
                    'Boil spaghetti in a pot of water, salting it less than usual.',
                    'Grind black pepper in a dry pan over medium heat to toast it.',
                    'Add a ladle of pasta water to the pan to stop cooking.',
                    'Finely grate Pecorino Romano and whisk with pasta water in a bowl to form a smooth paste.',
                    'Add pasta to the pan, remove from heat, toss in the cheese paste, and stir vigorously to emulsify into a creamy sauce.'
                ]
            ],
            [
                'name'=>'Portuguese Caldo Verde',
                'desc'=>'Hearty Portuguese soup with potato, kale and chorizo.',
                'cuisine'=>'Portuguese',
                'cat'=>'Dinner',
                'diff'=>'Easy',
                'time'=>30,
                'serv'=>4,
                'cost'=>1.10,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
                'tags'=>['Dairy-Free','Gluten-Free','High-Protein'],
                'ings'=>[['potatoes','500g',0.60],['kale','200g',0.60],['chorizo','100g',1.20],['onion','1 pc',0.20],['olive oil','2 tbsp',0.30]],
                'steps'=>[
                    'Sauté chopped onion and garlic in olive oil, then add diced potatoes and water.',
                    'Boil until potatoes are completely soft, then mash them directly into the broth to thicken it.',
                    'Slice chorizo and fry in a pan until crispy. Set aside.',
                    'Stir finely shredded kale into the boiling potato soup and cook for 3-5 minutes.',
                    'Serve soup hot topped with the crispy chorizo slices.'
                ]
            ],
            // SOUTH ASIAN
            [
                'name'=>'Sri Lankan Dhal Curry',
                'desc'=>'Comforting Sri Lankan red lentil curry with coconut milk and curry leaves.',
                'cuisine'=>'Sri Lankan',
                'cat'=>'Dinner',
                'diff'=>'Easy',
                'time'=>25,
                'serv'=>4,
                'cost'=>0.85,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
                'tags'=>['Vegan','Gluten-Free','Dairy-Free','High-Protein'],
                'ings'=>[['red lentils','300g',0.90],['coconut milk','200ml',0.60],['curry leaves','10 pcs',0.20],['turmeric','1 tsp',0.10],['mustard seeds','1 tsp',0.10]],
                'steps'=>[
                    'Rinse lentils and simmer with water, turmeric, onion, and garlic until lentils are mushy.',
                    'Pour in coconut milk and bring to a simmer.',
                    'In a separate small pan, heat oil and fry mustard seeds, curry leaves, and sliced shallots until brown.',
                    'Pour this hot tempered oil (Tarka) directly into the dhal curry and stir.',
                    'Serve hot with rice or flatbread.'
                ]
            ],
            [
                'name'=>'Bangladeshi Khichuri',
                'desc'=>'Comforting Bengali rice and lentil porridge with vegetables and ghee.',
                'cuisine'=>'Bangladeshi',
                'cat'=>'Dinner',
                'diff'=>'Easy',
                'time'=>30,
                'serv'=>4,
                'cost'=>0.70,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
                'tags'=>['Vegetarian','Gluten-Free','High-Protein'],
                'ings'=>[['rice','200g',0.30],['red lentils','150g',0.45],['onion','1 pc',0.20],['turmeric','1 tsp',0.10],['ghee','1 tbsp',0.30]],
                'steps'=>[
                    'Rinse rice and lentils together and drain.',
                    'Sauté sliced onion, ginger paste, cumin, and turmeric in oil in a large pot.',
                    'Add rice, lentils, and mixed vegetables, sautéing for 2 minutes.',
                    'Pour in hot water, bring to a boil, then cover and cook on low for 15-20 minutes.',
                    'Drizzle with a tablespoon of ghee before serving hot.'
                ]
            ],
            [
                'name'=>'Nepali Dal Bhat',
                'desc'=>'Nepali staple of steamed rice with lentil soup and vegetable curry.',
                'cuisine'=>'Nepali',
                'cat'=>'Dinner',
                'diff'=>'Easy',
                'time'=>30,
                'serv'=>2,
                'cost'=>0.80,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
                'tags'=>['Vegan','Gluten-Free','Dairy-Free','High-Protein'],
                'ings'=>[['rice','300g',0.40],['yellow lentils','150g',0.45],['tomatoes','2 pcs',0.40],['turmeric','1 tsp',0.10],['cumin','1 tsp',0.10]],
                'steps'=>[
                    'Boil yellow lentils in water with turmeric and salt until completely soft.',
                    'Temper the lentils by frying cumin seeds and garlic in oil and pouring it in.',
                    'Steam rice separately.',
                    'Sauté potatoes and cauliflower with curry powder to create a dry vegetable curry.',
                    'Serve Dal (lentil soup) and Bhat (steamed rice) side by side with the vegetable curry.'
                ]
            ],
            // LATIN AMERICAN
            [
                'name'=>'Brazilian Feijoada',
                'desc'=>'Brazilian black bean stew — a rich, hearty meal with rice.',
                'cuisine'=>'Brazilian',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>45,
                'serv'=>6,
                'cost'=>0.90,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
                'tags'=>['Dairy-Free','Gluten-Free','High-Protein'],
                'ings'=>[['black beans','400g',0.80],['pork sausage','200g',1.20],['garlic','4 cloves',0.20],['bay leaves','2 pcs',0.10],['rice','300g',0.40]],
                'steps'=>[
                    'Soak black beans overnight, then boil with bay leaves until soft.',
                    'In a pan, brown sliced sausage and sauté onions and garlic.',
                    'Add the sausage and onion mixture to the beans, along with a ladle of mashed beans to thicken.',
                    'Simmer everything together on low heat for 20 minutes.',
                    'Serve hot accompanied by steamed white rice.'
                ]
            ],
            [
                'name'=>'Peruvian Lomo Saltado',
                'desc'=>'Peruvian stir-fry of beef, tomatoes and peppers served with rice and fries.',
                'cuisine'=>'Peruvian',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>25,
                'serv'=>2,
                'cost'=>2.50,
                'pick'=>false,
                'img'=>'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
                'tags'=>['Dairy-Free','High-Protein'],
                'ings'=>[['beef strips','300g',2.50],['soy sauce','3 tbsp',0.30],['tomatoes','2 pcs',0.40],['red onion','1 pc',0.25],['rice','300g',0.40]],
                'steps'=>[
                    'Prepare french fries (oven-baked or fried) and steam rice.',
                    'Sauté beef strips in a very hot pan with oil until browned, then remove.',
                    'In the same pan, sauté sliced red onion and tomatoes for 2 minutes (they should remain crisp).',
                    'Return beef, toss in soy sauce and vinegar, and stir quickly.',
                    'Gently mix in the french fries and serve immediately with steamed rice.'
                ]
            ],
            [
                'name'=>'Mexican Huevos Rancheros',
                'desc'=>'Mexican breakfast of fried eggs on tortillas with tomato salsa.',
                'cuisine'=>'Mexican',
                'cat'=>'Breakfast',
                'diff'=>'Easy',
                'time'=>15,
                'serv'=>2,
                'cost'=>1.10,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400',
                'tags'=>['Vegetarian','Gluten-Free'],
                'ings'=>[['eggs','4 pcs',0.60],['corn tortillas','4 pcs',0.60],['canned tomatoes','400g',0.70],['onion','1 pc',0.20],['jalapeño','1 pc',0.15]],
                'steps'=>[
                    'Cook chopped onions, jalapeños, and canned tomatoes together to make a warm salsa.',
                    'Warm corn tortillas in a dry skillet until slightly crispy.',
                    'Fry eggs in a pan with oil until edges are crispy but yolks are runny.',
                    'Place two tortillas on each plate, spread warm salsa over them.',
                    'Place a fried egg on top of each salsa-covered tortilla and serve.'
                ]
            ],
            [
                'name'=>'Colombian Arepa',
                'desc'=>'Colombian grilled corn cakes with cheese — simple and satisfying.',
                'cuisine'=>'Colombian',
                'cat'=>'Breakfast',
                'diff'=>'Easy',
                'time'=>20,
                'serv'=>4,
                'cost'=>0.70,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400',
                'tags'=>['Vegetarian','Gluten-Free','High-Protein'],
                'ings'=>[['masarepa','300g',0.80],['mozzarella','100g',0.90],['butter','30g',0.25],['salt','to taste',0.05],['water','as needed',0.00]],
                'steps'=>[
                    'In a bowl, mix masarepa (pre-cooked cornmeal) and salt.',
                    'Slowly add warm water and butter, kneading until a smooth dough forms.',
                    'Fold in shredded mozzarella cheese and divide into small balls, flattening them into discs.',
                    'Grill arepas on a greased skillet over medium heat for 6-8 minutes on each side until golden brown.',
                    'Serve hot, optionally split open and spread with extra butter.'
                ]
            ],
            // OCEANIA & OTHERS
            [
                'name'=>'Australian Vegemite Toast',
                'desc'=>'Australian staple: toast with butter and Vegemite yeast extract.',
                'cuisine'=>'Australian',
                'cat'=>'Breakfast',
                'diff'=>'Easy',
                'time'=>5,
                'serv'=>1,
                'cost'=>0.50,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400',
                'tags'=>['Vegan','Dairy-Free'],
                'ings'=>[['bread','2 slices',0.30],['Vegemite','1 tsp',0.20],['margarine','1 tsp',0.10]],
                'steps'=>[
                    'Toast slices of bread until golden and crisp.',
                    'Immediately spread margarine or butter generously over the hot toast so it melts.',
                    'Spread a very thin layer of Vegemite over the butter (a little goes a long way!).',
                    'Serve immediately while warm.'
                ]
            ],
            [
                'name'=>'Hawaiian Spam Musubi',
                'desc'=>'Hawaiian snack of grilled Spam on sushi rice wrapped in nori.',
                'cuisine'=>'Hawaiian',
                'cat'=>'Snacks',
                'diff'=>'Easy',
                'time'=>20,
                'serv'=>4,
                'cost'=>1.00,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
                'tags'=>['Dairy-Free','Gluten-Free'],
                'ings'=>[['sushi rice','300g',0.80],['Spam','200g',1.50],['nori sheets','4 pcs',0.60],['soy sauce','2 tbsp',0.20],['sugar','1 tsp',0.05]],
                'steps'=>[
                    'Cook sushi rice and set aside.',
                    'Slice Spam and fry in a pan until slightly crispy.',
                    'Drizzle soy sauce and sugar over the Spam, glazing it in the pan.',
                    'Place a sheet of nori flat, mold a block of sushi rice, lay a slice of glazed Spam on top.',
                    'Wrap the nori sheet tightly around the rice and Spam, sealing with a drop of water.'
                ]
            ],
            [
                'name'=>'Myanmar Mohinga',
                'desc'=>'Myanmar national dish: fish broth noodle soup with lemongrass.',
                'cuisine'=>'Myanmar',
                'cat'=>'Breakfast',
                'diff'=>'Medium',
                'time'=>40,
                'serv'=>4,
                'cost'=>1.10,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
                'tags'=>['Dairy-Free','Gluten-Free','High-Protein'],
                'ings'=>[['rice noodles','250g',0.80],['fish sauce','3 tbsp',0.40],['lemongrass','2 stalks',0.30],['banana stem','100g',0.50],['shallots','4 pcs',0.30]],
                'steps'=>[
                    'Simmer fish in water with turmeric to cook, flake beef/fish and set aside, reserving broth.',
                    'Boil toasted rice powder and chickpea powder in water to create a thickening base.',
                    'Sauté lemongrass, ginger, garlic, onions, and chili, then add to the fish broth.',
                    'Add flaked fish, banana stem slices, and shallots, simmering for 20 minutes.',
                    'Serve fish broth hot poured over rice noodles, garnished with cilantro.'
                ]
            ],
            [
                'name'=>'Classic Spaghetti Carbonara',
                'desc'=>'Authentic Roman pasta made with crispy bacon, creamy egg yolks, and sharp Pecorino Romano.',
                'cuisine'=>'Italian',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>15,
                'serv'=>2,
                'cost'=>1.62,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
                'tags'=>['High-Protein'],
                'ings'=>[['spaghetti','200g',0.60],['bacon','100g',1.20],['eggs','3 pcs',0.45],['Pecorino Romano','50g',0.90],['black pepper','1 tsp',0.10]],
                'steps'=>[
                    'Bring a large pot of salted water to a boil and cook spaghetti until al dente.',
                    'Meanwhile, sizzle chopped bacon in a pan over medium heat until golden and crispy. Turn off heat.',
                    'In a bowl, whisk together whole eggs, egg yolks, and finely grated Pecorino Romano cheese until creamy.',
                    'Drain the pasta, reserving some cooking water. Toss hot pasta directly into the bacon pan.',
                    'Pour in the egg and cheese mixture along with a splash of pasta water, stirring vigorously off the heat to create a silky sauce.'
                ]
            ],
            [
                'name'=>'Chicken Tikka Masala',
                'desc'=>'Spiced, tender chicken pieces simmered in a rich, creamy tomato and butter sauce.',
                'cuisine'=>'Indian',
                'cat'=>'Dinner',
                'diff'=>'Medium',
                'time'=>25,
                'serv'=>3,
                'cost'=>1.50,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
                'tags'=>['High-Protein','Spicy'],
                'ings'=>[['chicken breast','400g',2.50],['heavy cream','100ml',0.60],['tomato sauce','1 can',0.80],['curry powder','2 tbsp',0.40],['garlic','4 cloves',0.20]],
                'steps'=>[
                    'Sauté minced garlic, ginger, and curry spices in a pan with oil until fragrant.',
                    'Add cubed chicken breasts and cook on medium-high heat until lightly browned.',
                    'Pour in tomato sauce and cover, simmering gently on medium-low for 15 minutes.',
                    'Stir in heavy cream and cook uncovered for another 5 minutes to thicken the sauce.',
                    'Serve hot garnished with fresh cilantro leaves over warm rice.'
                ]
            ],
            [
                'name'=>'Chicken Katsu Curry',
                'desc'=>'Crispy breaded chicken cutlet served with thick, rich Japanese curry sauce and rice.',
                'cuisine'=>'Japanese',
                'cat'=>'Lunch',
                'diff'=>'Medium',
                'time'=>30,
                'serv'=>2,
                'cost'=>1.70,
                'pick'=>true,
                'img'=>'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                'tags'=>['High-Protein','Dairy-Free'],
                'ings'=>[['chicken breast','300g',1.80],['breadcrumbs','50g',0.40],['eggs','1 pc',0.20],['curry paste','1 pc',0.60],['potato','1 pc',0.40]],
                'steps'=>[
                    'Simmer diced potatoes and carrots in water, then melt Japanese curry block in the broth until thick.',
                    'Flatten chicken breast, dip in flour, beaten egg, and coat thoroughly with panko breadcrumbs.',
                    'Shallow fry the breaded chicken katsu in a pan with oil until crispy and golden brown.',
                    'Slice the crispy katsu chicken into strips.',
                    'Plate steamed white rice, place the sliced chicken katsu on top, and ladle the rich curry sauce over the dish.'
                ]
            ]
        ];

        foreach ($recipes as $index => $r) {
            $recipe = Recipe::create([
                'name' => $r['name'], 'description' => $r['desc'],
                'cuisine' => $r['cuisine'], 'category' => $r['cat'],
                'difficulty' => $r['diff'], 'cook_time' => $r['time'],
                'servings' => $r['serv'], 'cost_per_serving' => $r['cost'],
                'image_url' => $r['img'], 'is_student_pick' => $r['pick'],
                'instructions' => $r['steps']
            ]);
            foreach ($r['tags'] as $tag) {
                $recipe->dietaryTags()->attach($tags[$tag]->id);
            }
            foreach ($r['ings'] as [$name, $qtyStr, $cost]) {
                preg_match('/^([0-9.]+)\s*([a-zA-Z\s]+)?$/', trim($qtyStr), $matches);
                $qty = 1.0;
                $unit = 'pcs';
                if (!empty($matches)) {
                    $qty = (float)$matches[1];
                    $unit = isset($matches[2]) ? trim($matches[2]) : 'pcs';
                } else {
                    $qty = 1.0;
                    $unit = trim($qtyStr);
                }

                if ($qty <= 0) {
                    $qty = 1.0;
                }

                $costPerUnit = $cost / $qty;

                $ing = Ingredient::firstOrCreate(
                    ['name' => $name],
                    ['unit' => $unit, 'cost_per_unit' => $costPerUnit]
                );

                $recipe->ingredients()->attach($ing->id, ['quantity' => $qty]);
            }
        }
    }
}
