var Neb = require("nebulas").Neb;
var Nebulas = require("nebulas");

var NebPay = require("nebpay");

// var neb = new Neb(new Nebulas.HttpRequest('https://testnet.nebulas.io'));
var neb = new Neb(new Nebulas.HttpRequest('https://mainnet.nebulas.io'));
var api = neb.api;


// 合约地址 test
// const dappAddress = 'n1piRPB5AafEAyh2LfB6kTuG3rJQ4aEQvx2';

// 合约地址 main
const dappAddress = 'n1ttLGkmWmaig2zMkKoVFJLA1VbYBeDeGyW';

var app = {
    init: function(){
        this.bindEvent();
    }, 
    bindEvent: function() {
        var that = this;
        console.log(888, neb);

        // 上链
        $(document).on('click', '.toChain', function(){
            $('#myModal').modal('show');
            that.queryRanking();
        });

        // 刷新排行榜
        $(document).on('click', '.refreshRanking', function(){
            that.refreshRanking();
        });

        // 提交上链
        $(document).on('click', '.submitToChain', function(){
            that.nickName = $('.nickName').val();
            if(!that.nickName) {
                alert('昵称不能为空');
                return;
            }

            if (localStorage.getItem('bubble-shooter')) {
                that.totalScore = JSON.parse(localStorage.getItem('bubble-shooter')).totalScore;
            }

            if(!that.totalScore) {
                alert('分数为0，不能上链');
                return;
            }

            if(that.blockchainScore > that.totalScore) {
                $('#myModal').modal('hide');
                popup({type:'error',msg:"总分小于链上的，继续努力哦!",delay:1500,callBack:function(){
                   
                }});
                return;
            }


            $('#myModal').modal('hide');
            that.showLoading();

            that.toChain();
        });
        
        that.refreshRanking();
        
    },
    nickName: '',
    totalScore: 0,
    blockchainScore: 0, 
    gamerAddress: localStorage.getItem('gamerAddress') ? localStorage.getItem('gamerAddress') : 'n1HeGGbCdSJX865kRFdgufMCDgRHeo3cB1a',
    /*刷新排行榜*/
    refreshRanking: function(){
        var that = this;

        // popup({type:'load',msg:"请等待",delay:1500,callBack:function(){
        //     // popup({type:"success",msg:"加载成功",delay:1000});
        // }});
    
        that.showLoading();
        
      var from = this.gamerAddress
      var value = '0'
      var nonce = '0'
      var gas_price = '1000000'
      var gas_limit = '2000000'

      // 获取排行榜列表
      var contract = {
          "function": "getRanking",
          "args": ""
      }

      neb.api.call(
        from,
        dappAddress,
        value,
        nonce,
        gas_price,
        gas_limit,
        contract
      ).then( (resp) => {
            console.log("数据查询完成", resp);
            that.hideLoading();
            if (resp["result"] !== "null") {

              that.rankingList = JSON.parse(resp["result"]);
              // 安score进行排序
              if (that.rankingList.length) {
                that.rankingList = _.sortBy(that.rankingList, (obj, key) => {
                  return -obj.score
                })
              }

              // 渲染排行榜列表
              console.log('rankinglist', that.rankingList);

                var template = $('#rankingTemplate').html();
                var compiledTemplate = Template7.compile(template);

                $('#rankingBox').html(compiledTemplate({
                    data: that.rankingList
                }));

            } else {

            }
        }).catch(function (err) {

            console.log("error:" + err.message)
        })

    },
    showLoading: function(){
        $('.loading-box').css('display', 'flex');
    },  
    hideLoading: function(){
        $('.loading-box').hide();
    },  
    /*上链*/
    toChain: function(){
        console.log(999);

        // 链上保存分数
        var nebPay = new NebPay();

        var nickname = this.nickName;
        var score = this.totalScore;

        var value = "0";
        var callFunction = "ranking";
        var callArgs =JSON.stringify([nickname, score]);
        console.log(callArgs);

        nebPay.call(
          dappAddress,
          value,
          callFunction,
          callArgs, {
            listener: this.callbackResult
          }
        );

    },
    /*查询链上分数*/
    queryRanking () {
      var from = this.gamerAddress
      var value = '0'
      var nonce = '0'
      var gas_price = '1000000'
      var gas_limit = '2000000'

      // 获取排行榜列表
      var contract = {
          "function": "getUserScore",
          "args": ""
      }

      neb.api.call(
        from,
        dappAddress,
        value,
        nonce,
        gas_price,
        gas_limit,
        contract
      ).then( (resp) => {
            if (resp["result"] !== "null") {

              this.blockchainScore = JSON.parse(resp["result"]).score;
              console.log("当前用户链上分数", this.blockchainScore);

            } else {

            }
        }).catch(function (err) {

            console.log("error:" + err.message)
        })

    },
    callbackResult (response) {
        var that = this;
      console.log("responseonse of push: " + JSON.stringify(response))

      if (JSON.stringify(response) === '"Error: Transaction rejected by user"') {


        console.error('上链已被您拒绝，请重新开始');
        app.hideLoading();

        popup({type:'error',msg:"上链已被您拒绝!",delay:3000,callBack:function(){
           
        }});

        return;
      }

      var intervalQuery = setInterval(() => {
        api.getTransactionReceipt({hash: response["txhash"]}).then((receipt) => {
            console.log("上链中...", receipt)
            if (receipt.from) {
              this.gamerAddress = receipt.from;
              // 存在localStorage
              localStorage.setItem('gamerAddress', receipt.from);
            }
            // console.log(receipt)
            if (receipt["status"] === 2) {
                console.log("pending.....")
            } else if (receipt["status"] === 1){

                app.hideLoading();

                console.log('上链成功');

                app.refreshRanking();

                popup({type:'success',msg:"上链成功!",delay:3000,callBack:function(){
                   
                }});

                //清除定时器
                clearInterval(intervalQuery)
            }else {
                console.log("交易失败......")
                app.hideLoading();

                console.error('上链失败，请重新再试');

                popup({type:'error',msg:"上链失败，请重新再试!",delay:3000,callBack:function(){
                   
                }});


                //清除定时器
                clearInterval(intervalQuery)
            }
        });
      }, 3000);

    }
};

$(function(){
    app.init();
});