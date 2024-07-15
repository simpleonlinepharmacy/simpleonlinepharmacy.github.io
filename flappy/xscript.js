$(document).ready(function() {

  /* making objects from the DOM */
   var container = $(".container");
   var bird = $(".bird");
   var pole = $(".pole");
   var pole_up = $(".up.pole");
   var pole_down = $(".down.pole");
   var score_val = $("#score span");
   var speed_val = $("#speed span");
   var cloud1 = $(".cloud1");
   var cloud2 = $(".cloud2");

  /* variables with initial values */
   var container_width = parseInt(container.width());
   var container_height = parseInt(container.height());
   var pole_initial_position = parseInt(pole.css('right'));
   var pole_initial_height = parseInt(pole.css('height'));
   var speed_initial = 10;
   var score_initial = 0;
   var bird_initial_position = parseInt(bird.css('top'));

   /* game logic */
   $(document).on('click' , '#start' , function() {

      /* vanishing start button on click */
      $('#start').hide();

      /* Tells how to play */
      alert("Press UP to play");


       var pole_position = pole_initial_position;
       var speed = speed_initial;
       var score = score_initial;
       var bird_position = bird_initial_position;

       var key_up = false;



       var the_game = setInterval(function () {
         if( collision(bird,pole_up) || collision(bird,pole_down)) {
               stop_the_game();

         } else {
                /* poles moving */
               pole_position = parseInt(pole.css('right'));

               if (pole_position > container_width) {

                  var pole_up_height = (Math.floor(Math.random()*260+1));    /*changing the heights of poles */
                  var pole_down_height = 400-pole_up_height-150;
                  pole_up.css('height',pole_up_height);
                  pole_down.css('height',pole_down_height);


                  pole_position = pole_initial_position-150;
                  speed+=1;               /* increment speed by 1 */
                  speed_val.html(speed);
                  score+=25;              /* increment score by 5 */
                  score_val.html(score);

               }

              pole.css('right',pole_position + speed);


            /*  bird moving down until a up key is pressed  */
              if (key_up===false && parseInt(bird.css('top'))<350) {      /* do not let go out of container */
                 bird.css('top',parseInt(bird.css('top'))+6);

              }


              /* cloud1 moving */
              if(parseInt(cloud1.css('right'))>container_width)
                {
                  cloud1.css('right',-3200);
                  cloud1.css('top', 20 + (Math.floor(Math.random()*290+1)));
                }
              cloud1.css('right',parseInt(cloud1.css('right'))+speed);

              cloud1.css('top',parseInt(cloud1.css('top')));

              /* cloud2 moving  */
              if(parseInt(cloud2.css('right'))>container_width)
                {
                  cloud2.css('right',-3200 - (Math.floor(Math.random()*300+1)));
                  cloud2.css('top', 20 + (Math.floor(Math.random()*290+1)));
                }
              cloud2.css('right',parseInt(cloud2.css('right'))+speed);

              cloud2.css('top',parseInt(cloud2.css('top')));





          }


       },40);

       /* on pressing up key the bird moves up by 40 px*/
       $(document).on('keydown',function(e){
           if(e.which==38 && the_game!=null ){     /* checking for up key press and whether the_game is running or not */
               key_up=true;
               if ( parseInt(bird.css('top'))>-10)    /* do not let go out of container */
                   bird.animate({top:"-=40"} ,200);
               key_up=false;
           }

       });
      

       /* Function for stopping the game */
       function stop_the_game(){
           clearInterval(the_game);
           the_game = null;      /* making the the_game null */

           /* hiding the poles, clouds, bird after game end */
           cloud1.css('display','none');
           cloud2.css('display','none');
           pole.css('display','none');
           bird.css('display','none');

           /*Displaying the "GAME OVER" and highlighting the score*/
           $('#start').html('<h1>GAME OVER</h1>');
           $('#start').css('font-size','30px');
           $('#start').show();
           $('#score').css('background-color',"#F39376");
           $('#score').css('box-shadow',"0px 0px 5px black");

           /* Displaying the "RESTART BAR" */
           $('#restart').css('display','block');


       }

       /* restarting game after pressing restart */

       $('#restart').click(function() {
          location.reload(window.location.href);
         
       });



       /* Function checks for collision of bird */
       function collision($div1, $div2){
           var x1 = $div1.offset().left;
           var y1 = $div1.offset().top;
           var h1 = $div1.outerHeight(true);
           var w1 = $div1.outerWidth(true);
           var b1 = y1 + h1;
           var r1 = x1 + w1;
           var x2 = $div2.offset().left;
           var y2 = $div2.offset().top;
           var h2 = $div2.outerHeight(true);
           var w2 = $div2.outerWidth(true);
           var b2 = y2 + h2;
           var r2 = x2 + w2;

           if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
           return true;
       }


    });

});