// 通用函数，返回被选择的元素或元素集合
function get(selector) {
    var method=selector.substr(0,1)=='.'?'getElementsByClassName':'getElementById';
    return document[method](selector.substr(1));//这个方括号是什么姿势？obj[method]();
}
//翻面控制
function turn(ele) {
    var cln=ele.className;
    var _index=ele.getAttribute('id').match(/\d+/g);
    console.log(_index);
    var nav_cln=get('.i-current')[0].className;
    //判断当前点击的元素是不是 photo_center，不是的话不执行后面的翻转而进行海报排序
        if(/photo-center/.test(cln)){
            if (/photo-front/.test(cln)){
                cln=cln.replace(/photo-front/,'photo-back');
                nav_cln=nav_cln.replace(/front/,'back');
            }
            else {
                cln=cln.replace(/photo-back/,'photo-front');
                nav_cln=nav_cln.replace(/back/,'front');
            }
            ele.className=cln;//如果放到turn()的最后，会覆盖resort()修改的className值；
            // if (/front/.test(nav_cln)){nav_cln=nav_cln.replace(/front/,'back');}
            //     else{nav_cln=nav_cln.replace(/back/,'front');}
            get('.i-current')[0].className=nav_cln;//同上
        }
        else {
            resort(_index);
            //cln+='photo-center';//resort()已经干过了；
        }
}
            /*随机数生成函数，在给定的范围内(random([min, max]))随机生成一个值，
             *因为此案例要在 20 张海报中随机选取一张居中显示，以及在左右两个分区内随机摆放
             *剩余海报，因为海报数量和左右区域都是有限制的，所以必须在给定范围内生成随机数。
             *传入的参数 range 是一个包含两个数值的数组，这两个数值即是给定范围的最小值(包含)和最大值(包含)
             *Math.random() 随机生成介于 0.0 ~ 1.0 之间的一个伪随机数
             */
function random(range) {
    var max=Math.max(range[0],range[1]);
    var min=Math.min(range[0],range[1]);
    var diff=max-min;
                 /*
                 *例如 [1, 20]，则 diff = 19 --> 0 <= Math.round(Math.random() * diff) <= 19
                 *然后再加上最小值，即可随机生成 1 ~ 20 之间的任意数，如果使用 Math.floor() 则
                 *生成 1 ~ 19 之间的任意数，使用 Math.ceil() 则生成 2 ~ 20 之间的任意数
                 */
    var number=Math.random()*diff+min;
    return parseInt(number);
}
//输出所有海报
// 使用模板替换的方法：然后在 JavaScript 中对其中的 {{}} 关键字进行替换
function addPhotos() {
    var template=get('#wrap').innerHTML;
    var html=[];
    var nav=[];
    for(var i in data){
        var _html=template
            .replace('{{index}}',i)
            .replace('{{caption}}',data[i].caption)
            .replace('{{img}}',data[i].img)
            .replace('{{desc}}',data[i].desc);
        html.push(_html);
        var _nav='<span id="nav_'+i+'" class="i" onclick="turn(get(\'#photo_'+i+'\'))"></span>';
        nav.push(_nav);
    }
    html.push('<nav id="nav" class="nav">'+nav.join('')+'</nav>');
    get('#wrap').innerHTML=html.join('');
    resort(random([0,data.length]));
}
addPhotos();
//排序所有海报
function resort(n){
    var _photos=get('.photo');//_photos不是标准数组，不支持sort()、splice()等函数
    var photos=[];//需要把_photos转化成有序的photos数组；
    for(var s=0;s<_photos.length;s++){//不是标准数组，不能用s in _photos写法
    /*一般来说，访问对象属性时使用的都是点表示法，不过，在 JavaScript 中也可以使用方括号表示法来访问
    *对象的属性。在使用方括号语法时，应该将要访问的属性以字符串的形式放在方括号中，如下面的例子所示:
    alert(person["name"]); //"Nicholas"
    alert(person.name); //"Nicholas"
    *方括号语法的主要优点是可以通过变量来访问属性，如果属性名中包含会导致语法错误的字符，或者属性名
    *使用的是关键字或保留字，也可以使用方括号表示法。例如：
     person["first name"] = "Nicholas";
    *通常，除非必须使用变量来访问属性，否则建议使用点表示法。(《JavaScript 高级程序设计》P85)
    */
        _photos[s].className=_photos[s].className.replace(/\s*photo-center\s*/,' ');
        _photos[s].className=_photos[s].className.replace(/\s*photo-back\s*/,' photo-front ');//连同前后的空格
        photos.push(_photos[s]);
        
        get('#nav_'+s).className='i';
    }
    var photo_center=photos.splice(n,1)[0];//从photos里取出一个
    photo_center.className+='photo-center';

    var photos_left=photos.splice(0,Math.ceil(photos.length/2));
    var photos_right=photos;

    var ranges=range();
    for(var i in photos_left){
        photos_left[i].style.left=random(ranges.left.x)+'px';
        photos_left[i].style.top=random(ranges.left.y)+'px';
        photos_left[i].style['-webkit-transform']='rotate('+random([-150,150])+'deg)';
    }
    for (var j in photos_right){
        photos[j].style.left=random(ranges.right.x)+'px';
        photos[j].style.top=random(ranges.right.y)+'px';
        photos_right[j].style['-webkit-transform']='rotate('+random([-150,150])+'deg)';
    }

    get('#nav_'+n).className+=' i-current i-front';
}
//计算左右分区范围
/*{left: {x: [左侧区域 left 的最小值, 左侧区域 left 的最大值], y: [左侧区域 top 的最小值, 左侧区域 top 的最大值]}, 
*right: {x: [右侧区域 left 的最小值, 右侧区域 left 的最大值], y: [右侧区域 top 的最小值, 右侧区域 top 的最大值]}}
*/
function range() {
    var range={left:{x:[],y:[]},right:{x:[],y:[]}};
     //获取最外围容器的宽度和高度
    var wrap={w:get('#wrap').clientWidth,h:get('#wrap').clientHeight};
    var photo={w:get('.photo')[0].clientWidth,h:get('.photo')[0].clientHeight};
     //按照自己想要显示的区域进行计算，左右区域的高度 (top) 范围是一样的
    range.left.x=[-photo.w/2,wrap.w/2-photo.w/2];
    range.left.y=[-photo.h/2,wrap.h];
    range.right.x=[wrap.w/2+photo.w/2,wrap.w-photo.w/2];
    range.right.y=range.left.y;
    return range;
}