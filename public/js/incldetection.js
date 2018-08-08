// 座標から傾きを計算 引数はctrack.getCurrentPosition()の返り値
function BiasScore(position) {
	// 返り値 0～1.57
	var Score;

	// 座標を取得できているかを確認
	if(typeof position !== 'undefined'){
		// 目の座標を取得
		const LeftXPoint = position[23][0];
		const LeftYPoint = position[23][1];
		const RightXPoint = position[28][0];
		const RightYPoint = position[28][1];

		// 目の角度を計算 0～3.14
		var EyeRadian  = Math.atan2(RightXPoint - LeftXPoint, RightYPoint - LeftYPoint);

		// 角度の絶対値を計算
		Score = Math.abs(EyeRadian-Math.PI/2);
	}else{
		// 座標を取得できなかった場合は、計測できる最大の角度を設定
		Score = Math.PI/2 ;
	}

	return Score ;

}
