

// MongoDB remove duplicates
var duplicates = [];
result = db.chords.aggregate([
  { $match: { 
    title: { "$ne": '' }  
  }},
  { $group: { 
    _id: { title: "$title"}, 
    dups: { "$addToSet": "$_id" }, 
    count: { "$sum": 1 } 
  }}, 
  { $match: { 
    count: { "$gt": 1 }   
  }}
])
result.forEach(function(doc) {
    doc.dups.shift();     
    doc.dups.forEach( function(dupId){ 
        duplicates.push(dupId);   
        }
    )    
})
printjson(duplicates);     
db.chords.remove({_id:{$in:duplicates}})