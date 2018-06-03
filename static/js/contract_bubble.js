'use strict';

var User = function(item) {
    if (item) {
        var obj = JSON.parse(item);
        this.address = obj.address;
        this.nickName = obj.nickName
        this.score = obj.score;
    } else {
        this.address = "";
        this.nickName = "";
        this.score = 0;
    }
};

User.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var BubbleContract = function() {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "rankingList", {
        parse: function(item) {
            return new User(item);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};



BubbleContract.prototype = {
    init: function() {
      this.size = 0;
    },
    toString: function() {
        return JSON.stringify(this);
    },
    /*排行榜*/
    ranking: function(nickName, score) {
        // 自动获取当前钱包检测到的登录钱包地址
        var from = Blockchain.transaction.from;

        var existUser;

        for(var i=0; i<this.size; i++){
          var tempObj = JSON.parse(this.rankingList.get(i));
          if (tempObj.address === from) {
            this.rankingList.del(i);
            this.size --;

            existUser = new User();

            existUser.address = from;
            existUser.nickName = nickName;
            existUser.score = score;

            this.rankingList.put(this.size, existUser);
            this.size ++;
          }
        }

        if (!existUser) {

          var gamerItem = new User();
          gamerItem.address = from;
          gamerItem.nickName = nickName;
          gamerItem.score = score;


          this.rankingList.put(this.size, gamerItem);

          this.size ++;
        }
    },
    /*获取排行榜数据*/
    getRanking: function() {
      var from = Blockchain.transaction.from;
      var list = [];

      for(var i=0; i<this.size; i++){
        var tempObj = JSON.parse(this.rankingList.get(i));
        list.push(tempObj);
      }

      return list;
    },
    /*上链之前先去查询该用户的分数*/
    getUserScore: function() {
      var from = Blockchain.transaction.from;

      var currUser;

      for(var i=0; i<this.size; i++){
        var tempObj = JSON.parse(this.rankingList.get(i));
        if (tempObj.address === from) {
          currUser = tempObj;
        }
      }

      if (currUser) {
        return currUser;
      } else {
        return 'none data';
      }
    }
};

module.exports = BubbleContract;
