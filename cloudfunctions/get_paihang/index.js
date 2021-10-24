// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router'); //云函数路由
cloud.init({
  env: '填入您的环境ID'
})

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  });
  let now = new Date().getTime()
  let ri_haomiao = 86400000
  let zhou_haomiao = 604800000
  let yue_haomiao = 86400000*30
  let nian_haomiao = 31536000000

  let ristart_time = now - ri_haomiao
  let zhoustart_time = now - zhou_haomiao
  let yuestart_time = now - yue_haomiao
  let nianstart_time = now - nian_haomiao 
        //日佣金排行
        app.router('get_riyong', async(ctx) => {
              ctx.body = await  db.collection('order').aggregate()
              .match({
                songda_time:_.lt(now),
                songda_time:_.gt(ristart_time)
              })
              .limit(100)
              .group({
                _id:{
                  _openid:'$_openid',
                jiedan_nickName:'$jiedan_nickName',
                jiedan_avatarUrl:'$jiedan_avatarUrl',
              },
              cost:$.sum('$cost'),
              })
              .sort({
                cost:-1,
              })
              .end()
        });
        //周佣金排行
        app.router('get_zhouyong', async(ctx) => {
              ctx.body = await  db.collection('order').aggregate()
              .match({
                songda_time:_.lt(now),
                songda_time:_.gt(zhoustart_time)
              })
              .limit(100)
              .group({
                _id:{
                  _openid:'$_openid',
                jiedan_nickName:'$jiedan_nickName',
                jiedan_avatarUrl:'$jiedan_avatarUrl',
              },
              cost:$.sum('$cost'),
              })
              .sort({
                cost:-1,
              })
              .end()
        });

        //月佣金排行
        app.router('get_yueyong', async(ctx) => {
              ctx.body = await  db.collection('order').aggregate()
              .match({
                songda_time:_.lt(now),
                songda_time:_.gt(yuestart_time)
              })
              .limit(100)
              .group({
                _id:{
                  _openid:'$_openid',
                jiedan_nickName:'$jiedan_nickName',
                jiedan_avatarUrl:'$jiedan_avatarUrl',
              },
              cost:$.sum('$cost'),
              })
              .sort({
                cost:-1,
              })
              .end()
        });
         //年佣金排行
         app.router('get_nianyong', async(ctx) => {
                ctx.body = await  db.collection('order').aggregate()
                .match({
                  songda_time:_.lt(now),
                  songda_time:_.gt(nianstart_time)
                })
                .limit(100)
                .group({
                  _id:{
                    _openid:'$_openid',
                  jiedan_nickName:'$jiedan_nickName',
                  jiedan_avatarUrl:'$jiedan_avatarUrl',
                },
                cost:$.sum('$cost'),
                })
                .sort({
                  cost:-1,
                })
                .end()
          });
           //日速度排行
          app.router('get_risu', async(ctx) => {
                ctx.body = await  db.collection('order').aggregate()
                .match({
                  songda_time:_.lt(now),
                  songda_time:_.gt(ristart_time)
                })
                .limit(100)
                .group({
                    _id:{
                      _openid:'$_openid',
                    jiedan_nickName:'$jiedan_nickName',
                    jiedan_avatarUrl:'$jiedan_avatarUrl',
                  },
                  zong_time:$.avg('$zong_time'),
                })
                .sort({
                  zong_time:1,
                })
                .end()
          });
           //周速度排行
           app.router('get_zhousu', async(ctx) => {
                  ctx.body = await  db.collection('order').aggregate()
                  .match({
                    songda_time:_.lt(now),
                    songda_time:_.gt(zhoustart_time)
                  })
                  .limit(100)
                  .group({
                      _id:{
                        _openid:'$_openid',
                      jiedan_nickName:'$jiedan_nickName',
                      jiedan_avatarUrl:'$jiedan_avatarUrl',
                    },
                    zong_time:$.avg('$zong_time'),
                  })
                  .sort({
                    zong_time:1,
                  })
                  .end()
            });
             //月速度排行
          app.router('get_yuesu', async(ctx) => {
                  ctx.body = await  db.collection('order').aggregate()
                  .match({
                    songda_time:_.lt(now),
                    songda_time:_.gt(yuestart_time)
                  })
                  .limit(100)
                  .group({
                      _id:{
                        _openid:'$_openid',
                      jiedan_nickName:'$jiedan_nickName',
                      jiedan_avatarUrl:'$jiedan_avatarUrl',
                    },
                    zong_time:$.avg('$zong_time'),
                  })
                  .sort({
                    zong_time:1,
                  })
                  .end()
            });
             //年速度排行
          app.router('get_niansu', async(ctx) => {
                ctx.body = await  db.collection('order').aggregate()
                .match({
                  songda_time:_.lt(now),
                  songda_time:_.gt(nianstart_time)
                })
                .limit(100)
                .group({
                    _id:{
                      _openid:'$_openid',
                    jiedan_nickName:'$jiedan_nickName',
                    jiedan_avatarUrl:'$jiedan_avatarUrl',
                  },
                  zong_time:$.avg('$zong_time'),
                })
                .sort({
                  zong_time:1,
                })
                .end()
          });


  return app.serve();
   
}