$(document).ready(function() {
  
  //  Modals initialized
    $('#saveModal').modal(); 
    $('#modalMessage').modal(); 
    $('#articleModal').modal(); 
  
    // Event listeners
    $('.searchArticle').on("click", () => { 

      fetch("/api/search", {method: "GET"}).then(() => window.location.replace("/api/search"));
    }); 
  
    // Save an article
    $('.addArticle').on("click", function(element) { 
  
      let headline = $(this).attr("data-headline");
      let summary = $(this).attr("data-summary");
      let url = $(this).attr("data-url");
      let imageURL = $(this).attr("data-imageURL");
      let slug = $(this).attr("data-slug");
      let modalID = $(this).attr("data-url") + "modal"
  
      // Create JSON for the backend
      let savedArticle = {
        headline,
        summary,
        url,
        imageURL,
        slug,
        comments: null
      };
  
      fetch("/api/add", { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(savedArticle)
      }).then((response) => {
        console.log(response)
        $("#modalMessage").modal('open');
        $("#modalMessage .modal-content ").html("<h4>Article Added!</h4>");
        setTimeout(() => $("#modalMessage").modal('close'), 1500);
        $(document.getElementById(url)).css('display', 'none');
      }); 
  
    }); 
    
    // Query for the savedArticles
    $('.savedArticles').on("click", () => { 
      console.log("Saved Button clicked");
      $(".collection").html("");
      $("#textarea1").val("");
  
      fetch("/api/savedArticles", {method: "GET"}).then(response => response.json()).then((response) => {
  
        response.map(article => {
          let articleDiv = "<li id='" + article["_id"] + "' data-url='" + article.url + "' data-slug='" + article.slug + "' class='collection-item avatar hover modal-trigger' href='#articleModal'><img src='" + article.imageURL + "'class='circle'><span class='title'>" + article.headline + "</span><p>" + article.summary + "</P><a class='secondary-content deleteArticle'><i class='material-icons hoverRed'>delete_forever</i></a></li>";
          $(".collection").prepend(articleDiv);
  
          // Store article data in sessionStorage
          sessionStorage.setItem(article["_id"], JSON.stringify(article)) 
  
          // Event listeners For each saved article button
          $(document.getElementById(article["_id"])).on("click", function(event) { 
  
            let modalID = $(this).attr("id");
  
            let sessionArticle = JSON.parse(sessionStorage.getItem(modalID));
            $('#articleModal').modal("open");
            let title = $(this).children(".title").text();
            $('#articleID').text(title);
  
            // Event listener for adding comments
            $(".addComment").on("click", function() { 
  
              let note = $('#textarea1').val();
  
              let noteObject = {
                body: {
                  body: note
                },
                articleID: {
                  articleID: modalID
                }
              }
  
              // Send savedArticle to the server
              fetch("/api/createNotes", { 
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteObject)
              }).then((response) => {
                location.reload();
              });
            });
  
            // Send savedArticle to the server
            fetch("/api/populateNote", { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({articleID: modalID})
            }).then(response => response.json()).then((data) => {
              console.log("fetching data");
              console.log("data is " + JSON.stringify(data))
              $(".boxComments").html("");
              if (data.length >= 1) {
                data.map((comment) => {
  
                  if (comment === null) {
                    let notesDiv = "<div class='col s12 m7'><div class='card horizontal'><div class='card-image'><img src='https://lorempixel.com/100/190/nature/1'></div><div class='card-stacked center'><div class='card-content valign-wrapper'><p>Add a Note! C'mon...all the cool kids are doing it.</p></div></div></div></div>";
                    $(".boxComments").prepend(notesDiv);
                  } else {
                    let notesDiv = "<div class='col s12 m7' id='" + comment["_id"] + "'><div class='card horizontal'><div class='card-image'><img src='https://lorempixel.com/100/190/nature/1'></div><div class='card-stacked center'><div class='card-content valign-wrapper'><p>" + comment.body + "</p></div><div class='card-action deleteComment' data-id=" + comment["_id"] + "><a href='#'>Delete</a></div></div></div></div>";
                    $(".boxComments").prepend(notesDiv);
                  }

                  // Event Listener for each delete note button
                  $(".deleteComment").on("click", function() { 
  
                    let commentID = $(this).attr("data-id");
  
                    console.log("comment Id is" + commentID)
  
                    // Send savedArticle to the server
                    fetch("/api/deleteComment", { 
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({"_id": commentID})
                    }).then((response) => {
                      $(document.getElementById(comment["_id"])).css('display', 'none');
                    });
  
                  });
  
                });
              } else {
                let notesDiv = "<div class='col s12 m7'><div class='card horizontal'><div class='card-image'><img src='https://lorempixel.com/100/190/nature/1'></div><div class='card-stacked center'><div class='card-content valign-wrapper'><p>Add a Note! C'mon...all the cool kids are doing it.</p></div></div></div></div>";
                $(".boxComments").prepend(notesDiv);
              }
            }); 
            event.stopPropagation();
          });
  
          // Event listener for the saved article delete button
          $(".deleteArticle").on("click", function(event) { 
            let modalID = $(this).parent().attr("id");
            let sessionArticle = JSON.parse(sessionStorage.getItem(modalID));
  
            
            fetch("/api/deleteArticle", { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(sessionArticle)
            }).then((response) => {
              console.log(response)
              $("#modalMessage").modal('open');
              $("#modalMessage .modal-content ").html('<h4> Deletion Completed:' + sessionArticle["_id"] + "</h4>");
              setTimeout(() => $("#modalMessage").modal('close'), 2000);
              $(document.getElementById(sessionArticle["_id"])).css('display', 'none');
            });
  
            event.stopPropagation();
          });
  
        });
      });
    }); 
  });